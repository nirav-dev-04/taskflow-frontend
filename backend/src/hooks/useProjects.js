import { useState, useCallback, useEffect } from "react";
import { projectService } from "../services/projectService";
import toast from "react-hot-toast";

/**
 * Full CRUD + filtering for projects.
 *
 * Returns:
 *   projects, project (single), isLoading, error, pagination,
 *   fetchProjects(params?), fetchProject(id),
 *   createProject(data), updateProject(id, data), deleteProject(id),
 *   filters, setFilters, searchQuery, setSearchQuery
 */
export function useProjects(autoFetch = true) {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
          ...filters,
          ...params,
        };
        const res = await projectService.getAll(query);
        setProjects(res.projects || res.data || res);
        if (res.pagination) setPagination(res.pagination);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load projects";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.limit, filters, searchQuery],
  );

  useEffect(() => {
    if (autoFetch) fetchProjects();
  }, [autoFetch, fetchProjects]);

  const fetchProject = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getById(id);
      setProject(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load project";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    setIsMutating(true);
    try {
      const created = await projectService.create(data);
      setProjects((prev) => [created, ...prev]);
      toast.success("Project created successfully");
      return created;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create project";
      toast.error(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateProject = useCallback(
    async (id, data) => {
      setIsMutating(true);
      try {
        const updated = await projectService.update(id, data);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === id ? { ...p, ...updated } : p)),
        );
        if (project && (project._id || project.id) === id)
          setProject({ ...project, ...updated });
        toast.success("Project updated successfully");
        return updated;
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update project";
        toast.error(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [project],
  );

  const deleteProject = useCallback(async (id) => {
    setIsMutating(true);
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success("Project deleted");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete project";
      toast.error(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const goToPage = useCallback((page) => {
    setPagination((p) => ({ ...p, page }));
  }, []);

  return {
    projects,
    project,
    isLoading,
    isMutating,
    error,
    pagination,
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    goToPage,
    setProject,
  };
}
