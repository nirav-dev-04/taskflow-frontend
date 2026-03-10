import { useState, useCallback, useEffect } from "react";
import { notificationService } from "../services/notificationService";

/**
 * Manages in-app notification state.
 *
 * Returns:
 *   notifications, unreadCount, isLoading,
 *   fetchNotifications(), markAsRead(id), markAllAsRead(),
 *   deleteNotification(id), clearAll()
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id || n.id === id ? { ...n, isRead: true } : n,
      ),
    );
    try {
      await notificationService.markRead(id);
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id ? { ...n, isRead: false } : n,
        ),
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const prev = notifications;
    setNotifications((n) => n.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      setNotifications(prev);
    }
  }, [notifications]);

  const deleteNotification = useCallback(
    async (id) => {
      const prev = notifications;
      setNotifications((n) => n.filter((item) => (item._id || item.id) !== id));
      try {
        await notificationService.delete(id);
      } catch {
        setNotifications(prev);
      }
    },
    [notifications],
  );

  const clearAll = useCallback(async () => {
    const prev = notifications;
    setNotifications([]);
    try {
      await notificationService.clearAll();
    } catch {
      setNotifications(prev);
    }
  }, [notifications]);

  /** Push a local (in-memory) notification — useful for socket events */
  const pushLocal = useCallback((notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: notification.id || Date.now(),
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    pushLocal,
  };
}
