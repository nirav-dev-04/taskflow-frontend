import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNotificationContext } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiRefreshCw,
  FiInbox,
} from "react-icons/fi";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export default function NotificationPanel() {
  const { isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    clearAll,
    fetchNotifications,
  } = useNotificationContext();

  const [filter, setFilter] = useState("all");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";
  const tabBg = isDark ? "#1e1e30" : "#f1f5f9";

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden w-90 shadow-2xl"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 20px 60px rgba(0,0,0,0.6)"
          : "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "520px",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.12)" }}
          >
            <FiBell size={14} color="#3b82f6" />
          </div>
          <h3
            className="font-black text-sm"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchNotifications()}
            title="Refresh"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = text;
              e.currentTarget.style.background = subtle;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = muted;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <FiRefreshCw
              size={13}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: muted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#10b981";
                e.currentTarget.style.background = "rgba(16,185,129,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = muted;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <FiCheck size={13} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: muted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = muted;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 px-3 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${border}`, backgroundColor: tabBg }}
      >
        {FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? notifications.length
              : f.id === "unread"
                ? notifications.filter((n) => !n.isRead).length
                : notifications.filter((n) => n.isRead).length;

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex-1 justify-center"
              style={{
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: filter === f.id ? cardBg : "transparent",
                color: filter === f.id ? text : muted,
                boxShadow:
                  filter === f.id
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.08)"
                    : "none",
              }}
            >
              {f.label}
              {count > 0 && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                  style={{
                    background:
                      filter === f.id
                        ? "rgba(59,130,246,0.12)"
                        : isDark
                          ? "#2a2a40"
                          : "#e2e8f0",
                    color: filter === f.id ? "#3b82f6" : muted,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3.5"
                style={{ borderBottom: `1px solid ${border}` }}
              >
                <div
                  className="w-9 h-9 rounded-xl animate-pulse shrink-0"
                  style={{ background: subtle }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-3.5 rounded-lg animate-pulse"
                    style={{ background: subtle, width: "85%" }}
                  />
                  <div
                    className="h-3 rounded-lg animate-pulse"
                    style={{ background: subtle, width: "50%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: subtle }}
            >
              <FiInbox size={24} style={{ color: muted }} />
            </div>
            <p
              className="text-sm font-bold"
              style={{ color: muted, fontFamily: "Syne, sans-serif" }}
            >
              {filter === "unread" ? "All caught up!" : "No notifications"}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {filter === "unread"
                ? "No unread notifications"
                : "You're up to date"}
            </p>
          </div>
        ) : (
          filtered.map((notification) => (
            <NotificationItem
              key={notification._id || notification.id}
              notification={notification}
            />
          ))
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      {!isLoading && notifications.length > 0 && (
        <div
          className="px-4 py-3 shrink-0 text-center"
          style={{ borderTop: `1px solid ${border}` }}
        >
          <p
            className="text-xs"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            {unreadCount > 0 ? (
              <>
                <span style={{ color: "#3b82f6", fontWeight: 700 }}>
                  {unreadCount}
                </span>{" "}
                unread · {notifications.length} total
              </>
            ) : (
              <>
                <span style={{ color: text, fontWeight: 700 }}>
                  {notifications.length}
                </span>{" "}
                notification{notifications.length !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
