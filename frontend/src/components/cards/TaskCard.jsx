import { useTheme } from "../../context/ThemeContext";
import { formatDueDate, isOverdue } from "../../utils/formateDate";
import {
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiFlag,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    icon: FiAlertTriangle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
  high: {
    label: "High",
    icon: FiFlag,
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
  },
  medium: {
    label: "Medium",
    icon: FiFlag,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  low: {
    label: "Low",
    icon: FiFlag,
    color: "#64748b",
    bg: "rgba(100,116,139,0.10)",
  },
};

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
  in_progress: {
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  review: { label: "In Review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  done: { label: "Done", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

const TAG_PALETTE = [
  { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  { color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
];
function getTagStyle(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}

const AVATAR_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];
function getAvatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  compact = false,
}) {
  const { isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1e1e30" : "#f1f5f9";

  const priority = PRIORITY_CONFIG[task?.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task?.status] || STATUS_CONFIG.todo;
  const PIcon = priority.icon;

  const assignees = task?.assignees || (task?.assignee ? [task.assignee] : []);
  const tags = task?.tags || [];
  const overdue = isOverdue(task?.dueDate);
  const dueLabel = formatDueDate(task?.dueDate);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        animation: "slideUp 0.5s ease forwards",
      }}
      onClick={() => onView?.(task)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-2">
          {/* Priority */}
          <span
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
            style={{
              color: priority.color,
              background: priority.bg,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <PIcon size={10} /> {priority.label}
          </span>
          {/* Status */}
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{
              color: status.color,
              background: status.bg,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Menu */}
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: muted }}
            onMouseEnter={(e) => (e.currentTarget.style.background = subtle)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <FiMoreVertical size={15} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-30 rounded-xl py-1 min-w-32.5 shadow-xl"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              {[
                { icon: FiEye, label: "View", action: onView, color: text },
                { icon: FiEdit2, label: "Edit", action: onEdit, color: text },
                {
                  icon: FiTrash2,
                  label: "Delete",
                  action: onDelete,
                  color: "#ef4444",
                },
              ].map(({ icon: Icon, label, action, color }) => (
                <button
                  key={label}
                  onClick={() => {
                    setMenuOpen(false);
                    action?.(task);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color, fontFamily: "DM Sans, sans-serif" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = subtle)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4
        className="font-black text-sm leading-snug mb-1.5 line-clamp-2"
        style={{ color: text, fontFamily: "Syne, sans-serif" }}
      >
        {task?.title || "Untitled Task"}
      </h4>

      {/* Description — hidden in compact mode */}
      {!compact && task?.description && (
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-2.5"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {task.description}
        </p>
      )}

      {/* Progress */}
      {typeof task?.progress === "number" && (
        <div className="mb-2.5">
          <div className="flex justify-between mb-1">
            <span
              className="text-[10px]"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              Progress
            </span>
            <span
              className="text-[10px] font-black"
              style={{ color: text, fontFamily: "Syne, sans-serif" }}
            >
              {task.progress}%
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: subtle }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${task.progress}%`,
                background: "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                transition: "width 0.7s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tags.slice(0, 3).map((tag) => {
            const ts = getTagStyle(tag);
            return (
              <span
                key={tag}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  color: ts.color,
                  background: ts.bg,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {tag}
              </span>
            );
          })}
          {tags.length > 3 && (
            <span
              className="text-[10px]"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2.5 mt-1"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {assignees.slice(0, 3).map((a, i) => {
            const name = a.name || a;
            return (
              <div
                key={i}
                title={name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{
                  background: getAvatarColor(name),
                  border: `2px solid ${cardBg}`,
                }}
              >
                {getInitials(name)}
              </div>
            );
          })}
          {assignees.length > 3 && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{
                background: subtle,
                color: muted,
                border: `2px solid ${cardBg}`,
              }}
            >
              +{assignees.length - 3}
            </div>
          )}
          {assignees.length === 0 && (
            <span
              className="text-[11px]"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              Unassigned
            </span>
          )}
        </div>

        {/* Due date */}
        {dueLabel && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{
              color: overdue ? "#ef4444" : muted,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <FiCalendar size={11} /> {dueLabel}
          </span>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
