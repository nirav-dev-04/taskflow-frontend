import api from "./api";

/**
 * Authentication service.
 * Axios interceptor unwraps response.data automatically.
 */
export const authService = {
  /** Login → returns { token, user } */
  login: (credentials) => api.post("/auth/login", credentials),

  /** Register a new user */
  register: (data) => api.post("/auth/register", data),

  /** Logout — invalidates token server-side */
  logout: () => api.post("/auth/logout"),

  /** Get currently authenticated user's profile */
  getMe: () => api.get("/auth/me"),

  /** Send password-reset email */
  forgotPassword: (data) => api.post("/auth/forgot-password", data),

  /** Reset password using token from email link */
  resetPassword: (data) => api.post("/auth/reset-password", data),

  /** Change password while authenticated */
  changePassword: (data) => api.put("/auth/change-password", data),

  /** Update current user's own profile (name, avatar, etc.) */
  updateProfile: (data) => api.put("/auth/profile", data),

  /** Verify email address with token */
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  /** Refresh access token using refresh token */
  refreshToken: () => api.post("/auth/refresh-token"),
};
