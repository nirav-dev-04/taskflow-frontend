import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { notificationService } from "../services/notificationService";
import toast from "react-hot-toast";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // panel open state
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationService.getAll(params);
      setNotifications(res.notifications || res.data || res);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // ── Mark as read ───────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationService.markRead(id);
    } catch {
      // Revert
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: false } : n)),
      );
      toast.error("Failed to mark notification as read");
    }
  }, []);

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const prev = notifications;
    setNotifications((n) => n.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      setNotifications(prev);
      toast.error("Failed to mark all notifications as read");
    }
  }, [notifications]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteNotification = useCallback(
    async (id) => {
      const prev = notifications;
      setNotifications((n) => n.filter((item) => (item._id || item.id) !== id));
      try {
        await notificationService.delete(id);
      } catch {
        setNotifications(prev);
        toast.error("Failed to delete notification");
      }
    },
    [notifications],
  );

  // ── Clear all ──────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    const prev = notifications;
    setNotifications([]);
    try {
      await notificationService.clearAll();
    } catch {
      setNotifications(prev);
      toast.error("Failed to clear notifications");
    }
  }, [notifications]);

  // ── Push local (from socket events) ───────────────────────────────────────
  const pushNotification = useCallback((notification) => {
    const newItem = {
      ...notification,
      id: notification.id || notification._id || Date.now(),
      isRead: false,
      createdAt: notification.createdAt || new Date().toISOString(),
    };
    setNotifications((prev) => [newItem, ...prev]);

    // Show a toast for incoming real-time notifications
    toast(notification.message || notification.title || "New notification", {
      icon: "🔔",
      duration: 4000,
    });
  }, []);

  // ── Panel toggle ───────────────────────────────────────────────────────────
  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <NotificationContext.Provider
      value={{
        // State
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        error,
        // Actions
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        pushNotification,
        // Panel
        openPanel,
        closePanel,
        togglePanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  return ctx;
}

export default NotificationContext;
