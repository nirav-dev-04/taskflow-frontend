import { useTheme } from "../../context/ThemeContext";
import { formatDueDate, isOverdue } from "../../utils/formateDate";
import { percentage } from "../../utils/helpers";
import {
  FiCalendar,
  FiUsers,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

const STATUS_CONFIG = {
  planning: { label: "Planning", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  on_hold: { label: "On Hold", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  completed: {
    label: "Completed",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#64748b" },
  medium: { label: "Medium", color: "#f59e0b" },
  high: { label: "High", color: "#ef4444" },
};

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

export default function ProjectCard({ project, onView, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1e1e30" : "#f1f5f9";

  const status = STATUS_CONFIG[project?.status] || STATUS_CONFIG.planning;
  const priority = PRIORITY_CONFIG[project?.priority] || PRIORITY_CONFIG.medium;

  const doneTasks = project?.taskCounts?.done || 0;
  const totalTasks = project?.taskCounts?.total || 0;
  const progress = project?.progress ?? percentage(doneTasks, totalTasks);
  const members = project?.members || [];
  const overdue = isOverdue(project?.dueDate);
  const dueLabel = formatDueDate(project?.dueDate);

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
      className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        animation: "slideUp 0.5s ease forwards",
      }}
      onClick={() => onView?.(project)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
              style={{
                background: status.bg,
                color: status.color,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {status.label}
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{
                color: priority.color,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              ● {priority.label}
            </span>
          </div>
          <h3
            className="font-black text-base leading-snug line-clamp-1"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {project?.name || "Untitled Project"}
          </h3>
        </div>

        {/* Menu */}
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={{ color: muted }}
            onMouseEnter={(e) => (e.currentTarget.style.background = subtle)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <FiMoreVertical size={16} />
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
                    action?.(project);
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

      {/* Description */}
      {project?.description && (
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-3"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span
            className="text-xs font-semibold"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            Progress
          </span>
          <span
            className="text-xs font-black"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {progress}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: subtle }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background:
                progress >= 100
                  ? "linear-gradient(90deg,#10b981,#34d399)"
                  : "linear-gradient(90deg,#3b82f6,#8b5cf6)",
            }}
          />
        </div>
        <p
          className="text-[10px] mt-1"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {doneTasks} of {totalTasks} tasks done
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {/* Members */}
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m, i) => {
              const name = m.name || m;
              return (
                <div
                  key={i}
                  title={name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background: getAvatarColor(name),
                    border: `2px solid ${cardBg}`,
                  }}
                >
                  {getInitials(name)}
                </div>
              );
            })}
            {members.length > 4 && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: subtle,
                  color: muted,
                  border: `2px solid ${cardBg}`,
                }}
              >
                +{members.length - 4}
              </div>
            )}
          </div>
          {members.length === 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              <FiUsers size={12} /> No members
            </span>
          )}
        </div>

        {/* Due date */}
        {dueLabel && (
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{
              color: overdue ? "#ef4444" : muted,
              background: overdue ? "rgba(239,68,68,0.10)" : subtle,
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
