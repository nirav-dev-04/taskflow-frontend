import api from "./api";

/**
 * Task service — full CRUD + status, assignment, comments, attachments.
 */
export const taskService = {
  // ── Core CRUD ─────────────────────────────────────────────────────────────

  /** Get all tasks (supports: page, limit, search, status, priority, assignee) */
  getAll: (params = {}) => api.get("/tasks", { params }),

  /** Get all tasks belonging to a specific project */
  getByProject: (projectId, params = {}) =>
    api.get(`/projects/${projectId}/tasks`, { params }),

  /** Get tasks assigned to the current user */
  getMyTasks: (params = {}) => api.get("/tasks/my-tasks", { params }),

  /** Get a single task by ID */
  getById: (id) => api.get(`/tasks/${id}`),

  /** Create a new task */
  create: (data) => api.post("/tasks", data),

  /** Update a task by ID */
  update: (id, data) => api.put(`/tasks/${id}`, data),

  /** Lightweight status-only update (used by Kanban drag-drop) */
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  /** Delete a task by ID */
  delete: (id) => api.delete(`/tasks/${id}`),

  // ── Assignment ────────────────────────────────────────────────────────────

  /** Assign a task to a user */
  assign: (id, userId) => api.patch(`/tasks/${id}/assign`, { userId }),

  /** Unassign a task */
  unassign: (id) => api.patch(`/tasks/${id}/unassign`),

  // ── Comments ──────────────────────────────────────────────────────────────

  /** Get all comments for a task */
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),

  /** Add a comment to a task */
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),

  /** Update a comment */
  updateComment: (taskId, commentId, data) =>
    api.put(`/tasks/${taskId}/comments/${commentId}`, data),

  /** Delete a comment */
  deleteComment: (taskId, commentId) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),

  // ── Attachments ───────────────────────────────────────────────────────────

  /** Upload an attachment to a task */
  uploadAttachment: (taskId, formData) =>
    api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Delete an attachment */
  deleteAttachment: (taskId, attachmentId) =>
    api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),

  // ── Bulk Operations ───────────────────────────────────────────────────────

  /** Bulk update task statuses */
  bulkUpdateStatus: (taskIds, status) =>
    api.patch("/tasks/bulk/status", { taskIds, status }),

  /** Bulk delete tasks */
  bulkDelete: (taskIds) => api.delete("/tasks/bulk", { data: { taskIds } }),
};
