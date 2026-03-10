import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { taskService } from "../services/taskServices";
import toast from "react-hot-toast";

/**
 * Task store — in-memory (not persisted)
 *
 * Exposes:
 *   tasks[], task (active single), isLoading, isMutating, error
 *   filters, searchQuery, taskCounts
 *   fetchTasks(), fetchTaskById(), fetchMyTasks()
 *   createTask(), updateTask(), updateTaskStatus(), deleteTask()
 *   setFilters(), setSearchQuery()
 */
export const useTaskStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      tasks: [],
      task: null,
      isLoading: false,
      isMutating: false,
      error: null,
      filters: { status: "", priority: "", assignee: "" },
      searchQuery: "",

      // ── Derived ───────────────────────────────────────────────────────────
      get taskCounts() {
        const tasks = get().tasks;
        return {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "todo").length,
          in_progress: tasks.filter((t) => t.status === "in_progress").length,
          review: tasks.filter((t) => t.status === "review").length,
          done: tasks.filter((t) => t.status === "done").length,
        };
      },

      // ── Fetch ─────────────────────────────────────────────────────────────

      fetchTasks: async (projectId = null, params = {}) => {
        const { filters, searchQuery } = get();
        set({ isLoading: true, error: null });
        try {
          const query = { search: searchQuery, ...filters, ...params };
          const res = projectId
            ? await taskService.getByProject(projectId, query)
            : await taskService.getAll(query);
          set({ tasks: res.tasks || res.data || res, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err.response?.data?.message || "Failed to load tasks",
          });
        }
      },

      fetchMyTasks: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const res = await taskService.getMyTasks(params);
          set({ tasks: res.tasks || res.data || res, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err.response?.data?.message || "Failed to load tasks",
          });
        }
      },

      fetchTaskById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const task = await taskService.getById(id);
          set({ task, isLoading: false });
          return task;
        } catch (err) {
          set({
            isLoading: false,
            error: err.response?.data?.message || "Failed to load task",
          });
          throw err;
        }
      },

      // ── Mutations ─────────────────────────────────────────────────────────

      createTask: async (data) => {
        set({ isMutating: true });
        try {
          const created = await taskService.create(data);
          set((state) => ({
            tasks: [created, ...state.tasks],
            isMutating: false,
          }));
          toast.success("Task created");
          return created;
        } catch (err) {
          set({ isMutating: false });
          toast.error(err.response?.data?.message || "Failed to create task");
          throw err;
        }
      },

      updateTask: async (id, data) => {
        set({ isMutating: true });
        const prevTasks = get().tasks;
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) =>
            (t._id || t.id) === id ? { ...t, ...data } : t,
          ),
        }));
        try {
          const updated = await taskService.update(id, data);
          set((state) => ({
            isMutating: false,
            tasks: state.tasks.map((t) =>
              (t._id || t.id) === id ? { ...t, ...updated } : t,
            ),
            task:
              state.task && (state.task._id || state.task.id) === id
                ? { ...state.task, ...updated }
                : state.task,
          }));
          toast.success("Task updated");
          return updated;
        } catch (err) {
          set({ tasks: prevTasks, isMutating: false });
          toast.error(err.response?.data?.message || "Failed to update task");
          throw err;
        }
      },

      /** Lightweight status-only patch — used by Kanban drag-drop (no toast) */
      updateTaskStatus: async (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            (t._id || t.id) === id ? { ...t, status } : t,
          ),
        }));
        try {
          await taskService.updateStatus(id, status);
        } catch (err) {
          console.error("[TaskStore] status update failed:", err.message);
        }
      },

      deleteTask: async (id) => {
        set({ isMutating: true });
        const prevTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.filter((t) => (t._id || t.id) !== id),
        }));
        try {
          await taskService.delete(id);
          set({ isMutating: false });
          toast.success("Task deleted");
        } catch (err) {
          set({ tasks: prevTasks, isMutating: false });
          toast.error(err.response?.data?.message || "Failed to delete task");
          throw err;
        }
      },

      // ── Filters ───────────────────────────────────────────────────────────

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      resetFilters: () =>
        set({
          filters: { status: "", priority: "", assignee: "" },
          searchQuery: "",
        }),

      // ── Utils ─────────────────────────────────────────────────────────────

      setTask: (task) => set({ task }),
      setTasks: (tasks) => set({ tasks }),
      clearError: () => set({ error: null }),
    }),
    { name: "TaskStore" },
  ),
);
