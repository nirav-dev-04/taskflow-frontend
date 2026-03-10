import api from "./api";

/**
 * Project service — full CRUD + members + stats.
 */
export const projectService = {
  // ── Core CRUD ─────────────────────────────────────────────────────────────

  /** Get all projects (supports query params: page, limit, search, status, priority) */
  getAll: (params = {}) => api.get("/projects", { params }),

  /** Get a single project by ID */
  getById: (id) => api.get(`/projects/${id}`),

  /** Create a new project */
  create: (data) => api.post("/projects", data),

  /** Update a project by ID */
  update: (id, data) => api.put(`/projects/${id}`, data),

  /** Delete a project by ID */
  delete: (id) => api.delete(`/projects/${id}`),

  // ── Members ───────────────────────────────────────────────────────────────

  /** Get all members of a project */
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),

  /** Add a member to a project */
  addMember: (projectId, data) =>
    api.post(`/projects/${projectId}/members`, data),

  /** Remove a member from a project */
  removeMember: (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`),

  /** Update a member's role within a project */
  updateMemberRole: (projectId, userId, data) =>
    api.patch(`/projects/${projectId}/members/${userId}`, data),

  // ── Stats & Activity ──────────────────────────────────────────────────────

  /** Get project statistics (task counts, progress, etc.) */
  getStats: (projectId) => api.get(`/projects/${projectId}/stats`),

  /** Get recent activity for a project */
  getActivity: (projectId, params = {}) =>
    api.get(`/projects/${projectId}/activity`, { params }),

  // ── Sprints ───────────────────────────────────────────────────────────────

  /** Get all sprints for a project */
  getSprints: (projectId) => api.get(`/projects/${projectId}/sprints`),

  /** Create a sprint for a project */
  createSprint: (projectId, data) =>
    api.post(`/projects/${projectId}/sprints`, data),

  /** Update a sprint */
  updateSprint: (projectId, sprintId, data) =>
    api.put(`/projects/${projectId}/sprints/${sprintId}`, data),

  /** Delete a sprint */
  deleteSprint: (projectId, sprintId) =>
    api.delete(`/projects/${projectId}/sprints/${sprintId}`),
};
