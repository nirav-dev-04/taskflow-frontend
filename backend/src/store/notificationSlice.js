import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { notificationService } from "../services/notificationService";

/**
 * Notification store — in-memory (not persisted)
 *
 * Exposes:
 *   notifications[], unreadCount, isLoading, error
 *   fetchNotifications(), markAsRead(id), markAllAsRead()
 *   deleteNotification(id), clearAll(), pushLocal(notification)
 */
export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      notifications: [],
      isLoading: false,
      error: null,

      // ── Derived (computed via getter) ─────────────────────────────────────
      get unreadCount() {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      // ── Actions ──────────────────────────────────────────────────────────

      fetchNotifications: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const data = await notificationService.getAll(params);
          set({ notifications: data.notifications || data, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err.message || "Failed to load notifications",
          });
        }
      },

      markAsRead: async (id) => {
        // Optimistic
        set((state) => ({
          notifications: state.notifications.map((n) =>
            (n._id || n.id) === id ? { ...n, isRead: true } : n,
          ),
        }));
        try {
          await notificationService.markRead(id);
        } catch {
          // Revert
          set((state) => ({
            notifications: state.notifications.map((n) =>
              (n._id || n.id) === id ? { ...n, isRead: false } : n,
            ),
          }));
        }
      },

      markAllAsRead: async () => {
        const prev = get().notifications;
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        }));
        try {
          await notificationService.markAllRead();
        } catch {
          set({ notifications: prev });
        }
      },

      deleteNotification: async (id) => {
        const prev = get().notifications;
        set((state) => ({
          notifications: state.notifications.filter(
            (n) => (n._id || n.id) !== id,
          ),
        }));
        try {
          await notificationService.delete(id);
        } catch {
          set({ notifications: prev });
        }
      },

      clearAll: async () => {
        const prev = get().notifications;
        set({ notifications: [] });
        try {
          await notificationService.clearAll();
        } catch {
          set({ notifications: prev });
        }
      },

      /** Push a real-time notification from a socket event */
      pushLocal: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: notification.id || Date.now(),
              isRead: false,
              createdAt: notification.createdAt || new Date().toISOString(),
            },
            ...state.notifications,
          ],
        }));
      },

      clearError: () => set({ error: null }),
    }),
    { name: "NotificationStore" },
  ),
);
