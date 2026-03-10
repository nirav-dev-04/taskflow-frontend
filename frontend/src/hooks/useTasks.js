import { useState, useCallback, useEffect } from "react";
import { taskService } from "../services/taskService";
import toast from "react-hot-toast";

/**
 * Full CRUD + filtering for tasks, optionally scoped to a project.
 *
 * @param {string} projectId  - if provided, auto-fetches tasks for this project
 * @param {boolean} autoFetch - whether to fetch on mount (default true)
 *
 * Returns:
 *   tasks, isLoading, isMutating, error,
 *   fetchTasks(params?), fetchTaskById(id),
 *   createTask(data), updateTask(id, data), deleteTask(id),
 *   updateTaskStatus(id, status),
 *   filters, setFilters, searchQuery, setSearchQuery
 */
export function useTasks(projectId = null, autoFetch = true) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = { search: searchQuery, ...filters, ...params };
        const data = projectId
          ? await taskService.getByProject(projectId, query)
          : await taskService.getAll(query);
        setTasks(data.tasks || data.data || data);
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Failed to load tasks";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, filters, searchQuery],
  );

  useEffect(() => {
    if (autoFetch) fetchTasks();
  }, [autoFetch, fetchTasks]);

  const fetchTaskById = useCallback(async (id) => {
    try {
      return await taskService.getById(id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load task");
      throw err;
    }
  }, []);

  const createTask = useCallback(
    async (data) => {
      setIsMutating(true);
      try {
        const payload = projectId ? { ...data, project: projectId } : data;
        const created = await taskService.create(payload);
        setTasks((prev) => [created, ...prev]);
        toast.success("Task created");
        return created;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create task");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [projectId],
  );

  const updateTask = useCallback(
    async (id, data) => {
      setIsMutating(true);
      // Optimistic update
      const previous = tasks;
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, ...data } : t)),
      );
      try {
        const updated = await taskService.update(id, data);
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === id ? { ...t, ...updated } : t)),
        );
        toast.success("Task updated");
        return updated;
      } catch (err) {
        setTasks(previous); // revert
        toast.error(err.response?.data?.message || "Failed to update task");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [tasks],
  );

  /** Lightweight status-only update — used by Kanban drag-drop */
  const updateTaskStatus = useCallback(async (id, status) => {
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, status } : t)),
    );
    try {
      await taskService.updateStatus(id, status);
    } catch (err) {
      // Silently revert — let the board handle rollback if needed
      console.error("[useTasks] status update failed:", err.message);
    }
  }, []);

  const deleteTask = useCallback(
    async (id) => {
      setIsMutating(true);
      const previous = tasks;
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      try {
        await taskService.delete(id);
        toast.success("Task deleted");
      } catch (err) {
        setTasks(previous);
        toast.error(err.response?.data?.message || "Failed to delete task");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [tasks],
  );

  /** Counts grouped by status */
  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return {
    tasks,
    isLoading,
    isMutating,
    error,
    taskCounts,
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    setTasks,
  };
}
