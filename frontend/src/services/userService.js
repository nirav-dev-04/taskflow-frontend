import api from "./api";

/**
 * User service — admin user management + team operations.
 */
export const userService = {
  // ── Admin: User Management ────────────────────────────────────────────────

  /** Get all users — admin only (supports: page, limit, search, role, status) */
  getAll: (params = {}) => api.get("/users", { params }),

  /** Get a single user by ID */
  getById: (id) => api.get(`/users/${id}`),

  /** Create a new user — admin only */
  create: (data) => api.post("/users", data),

  /** Update a user by ID — admin only */
  update: (id, data) => api.put(`/users/${id}`, data),

  /** Delete a user by ID — admin only */
  delete: (id) => api.delete(`/users/${id}`),

  /** Activate a user account */
  activate: (id) => api.patch(`/users/${id}/activate`),

  /** Deactivate a user account */
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),

  /** Change a user's role — admin only */
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),

  // ── Profile ───────────────────────────────────────────────────────────────

  /** Get current authenticated user's full profile */
  getProfile: () => api.get("/users/profile"),

  /** Update current user's profile */
  updateProfile: (data) => api.put("/users/profile", data),

  /** Upload a profile avatar */
  uploadAvatar: (formData) =>
    api.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Remove current user's avatar */
  removeAvatar: () => api.delete("/users/profile/avatar"),

  // ── Team / Directory ──────────────────────────────────────────────────────

  /** Get all users available as team members (lightweight list) */
  getTeamMembers: (params = {}) => api.get("/users/team", { params }),

  /** Search users by name or email (for assignee pickers, etc.) */
  search: (query) => api.get("/users/search", { params: { q: query } }),

  /** Get users belonging to a specific project */
  getByProject: (projectId) => api.get(`/projects/${projectId}/members`),

  // ── Stats ─────────────────────────────────────────────────────────────────

  /** Get user activity stats — admin dashboard */
  getStats: () => api.get("/users/stats"),

  /** Get a specific user's task statistics */
  getUserStats: (id) => api.get(`/users/${id}/stats`),
};
