import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { projectService } from "../services/projectService";
import toast from "react-hot-toast";

/**
 * Project store — in-memory (not persisted)
 *
 * Exposes:
 *   projects[], project (active single), isLoading, isMutating, error
 *   pagination, filters, searchQuery
 *   fetchProjects(), fetchProject(id)
 *   createProject(), updateProject(), deleteProject()
 *   setFilters(), setSearchQuery(), goToPage()
 */
export const useProjectStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      projects: [],
      project: null,
      isLoading: false,
      isMutating: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
      filters: { status: "", priority: "" },
      searchQuery: "",

      // ── Fetch ─────────────────────────────────────────────────────────────

      fetchProjects: async (params = {}) => {
        const { pagination, filters, searchQuery } = get();
        set({ isLoading: true, error: null });
        try {
          const query = {
            page: pagination.page,
            limit: pagination.limit,
            search: searchQuery,
            ...filters,
            ...params,
          };
          const res = await projectService.getAll(query);
          set({
            projects: res.projects || res.data || res,
            pagination: res.pagination || get().pagination,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err.response?.data?.message || "Failed to load projects",
          });
        }
      },

      fetchProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const project = await projectService.getById(id);
          set({ project, isLoading: false });
          return project;
        } catch (err) {
          set({
            isLoading: false,
            error: err.response?.data?.message || "Failed to load project",
          });
          throw err;
        }
      },

      // ── Mutations ─────────────────────────────────────────────────────────

      createProject: async (data) => {
        set({ isMutating: true });
        try {
          const created = await projectService.create(data);
          set((state) => ({
            projects: [created, ...state.projects],
            isMutating: false,
          }));
          toast.success("Project created successfully");
          return created;
        } catch (err) {
          set({ isMutating: false });
          toast.error(
            err.response?.data?.message || "Failed to create project",
          );
          throw err;
        }
      },

      updateProject: async (id, data) => {
        set({ isMutating: true });
        try {
          const updated = await projectService.update(id, data);
          set((state) => ({
            isMutating: false,
            projects: state.projects.map((p) =>
              (p._id || p.id) === id ? { ...p, ...updated } : p,
            ),
            project:
              state.project && (state.project._id || state.project.id) === id
                ? { ...state.project, ...updated }
                : state.project,
          }));
          toast.success("Project updated");
          return updated;
        } catch (err) {
          set({ isMutating: false });
          toast.error(
            err.response?.data?.message || "Failed to update project",
          );
          throw err;
        }
      },

      deleteProject: async (id) => {
        set({ isMutating: true });
        try {
          await projectService.delete(id);
          set((state) => ({
            isMutating: false,
            projects: state.projects.filter((p) => (p._id || p.id) !== id),
            project:
              (state.project?._id || state.project?.id) === id
                ? null
                : state.project,
          }));
          toast.success("Project deleted");
        } catch (err) {
          set({ isMutating: false });
          toast.error(
            err.response?.data?.message || "Failed to delete project",
          );
          throw err;
        }
      },

      // ── Filter / Pagination ───────────────────────────────────────────────

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      setSearchQuery: (searchQuery) => {
        set((state) => ({
          searchQuery,
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      goToPage: (page) => {
        set((state) => ({ pagination: { ...state.pagination, page } }));
      },

      setProject: (project) => set({ project }),
      clearError: () => set({ error: null }),
      resetFilters: () =>
        set({ filters: { status: "", priority: "" }, searchQuery: "" }),
    }),
    { name: "ProjectStore" },
  ),
);
