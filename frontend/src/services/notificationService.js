import api from "./api";

/**
 * Notification service.
 */
export const notificationService = {
  /** Get all notifications for the current user */
  getAll: (params = {}) => api.get("/notifications", { params }),

  /** Get unread count only */
  getUnreadCount: () => api.get("/notifications/unread-count"),

  /** Mark a single notification as read */
  markRead: (id) => api.patch(`/notifications/${id}/read`),

  /** Mark all notifications as read */
  markAllRead: () => api.patch("/notifications/mark-all-read"),

  /** Delete a single notification */
  delete: (id) => api.delete(`/notifications/${id}`),

  /** Delete all notifications for current user */
  clearAll: () => api.delete("/notifications"),

  /** Get notification preferences */
  getPreferences: () => api.get("/notifications/preferences"),

  /** Update notification preferences */
  updatePreferences: (data) => api.put("/notifications/preferences", data),
};
