import { useTheme } from "../../context/ThemeContext";
import { useNotificationContext } from "../../context/NotificationContext";
import { formatRelativeTime } from "../../utils/formateDate";
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";

const TYPE_CONFIG = {
  task_assigned: {
    icon: FiUser,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  task_updated: {
    icon: FiCheckCircle,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  task_completed: {
    icon: FiCheckCircle,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  task_due_soon: {
    icon: FiCalendar,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  task_overdue: {
    icon: FiAlertTriangle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
  comment_added: {
    icon: FiMessageSquare,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
  },
  mention: {
    icon: FiMessageSquare,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
  },
  project_created: {
    icon: FiInfo,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
  },
  project_updated: {
    icon: FiInfo,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
  },
  member_added: { icon: FiUser, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  default: { icon: FiBell, color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

export default function NotificationItem({ notification }) {
  const { isDark } = useTheme();
  const { markAsRead, deleteNotification } = useNotificationContext();

  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const cardBg = isDark ? "#12121f" : "#ffffff";
  const unreadBg = isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.03)";
  const hoverBg = isDark ? "#16162a" : "#f8fafc";

  const id = notification?._id || notification?.id;
  const isUnread = !notification?.isRead;
  const cfg = TYPE_CONFIG[notification?.type] || TYPE_CONFIG.default;
  const Icon = cfg.icon;

  function handleMarkRead(e) {
    e.stopPropagation();
    if (isUnread) markAsRead(id);
  }

  function handleDelete(e) {
    e.stopPropagation();
    deleteNotification(id);
  }

  function handleClick() {
    if (isUnread) markAsRead(id);
    // Optional: navigate to linked resource
    if (notification?.link) window.location.href = notification.link;
  }

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150"
      style={{
        backgroundColor: isUnread ? unreadBg : "transparent",
        borderBottom: `1px solid ${border}`,
      }}
      onMouseEnter={(e) => {
        if (!isUnread) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isUnread
          ? unreadBg
          : "transparent";
      }}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <span
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
        />
      )}

      {/* Type icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}
      >
        <Icon size={16} color={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug line-clamp-2 mb-0.5"
          style={{
            color: text,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: isUnread ? 600 : 400,
          }}
        >
          {notification?.message || notification?.title || "New notification"}
        </p>

        {notification?.subtitle && (
          <p
            className="text-xs line-clamp-1 mb-0.5"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            {notification.subtitle}
          </p>
        )}

        <p
          className="text-[11px]"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {formatRelativeTime(notification?.createdAt)}
        </p>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {isUnread && (
          <button
            onClick={handleMarkRead}
            title="Mark as read"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ color: "#10b981" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(16,185,129,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <FiCheck size={13} />
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: "#ef4444" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(239,68,68,0.12)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
}
