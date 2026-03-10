import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatDate, isOverdue } from "../../utils/formateDate";
import { percentage } from "../../utils/helpers";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiChevronUp,
  FiChevronDown,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiPlus,
} from "react-icons/fi";

const STATUS_CFG = {
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
const PRIORITY_CFG = {
  low: { color: "#64748b" },
  medium: { color: "#f59e0b" },
  high: { color: "#ef4444" },
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
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field)
    return <FiChevronUp size={12} style={{ opacity: 0.3 }} />;
  return sortDir === "asc" ? (
    <FiChevronUp size={12} />
  ) : (
    <FiChevronDown size={12} />
  );
}

export default function ProjectTable({
  projects = [],
  isLoading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  searchQuery,
  onSearchChange,
}) {
  const { isDark } = useTheme();
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";
  const rowHover = isDark ? "#16162a" : "#f8fafc";
  const headBg = isDark ? "#16162a" : "#f8fafc";

  function handleSort(field) {
    setSortDir(sortField === field && sortDir === "asc" ? "desc" : "asc");
    setSortField(field);
  }

  const sorted = [...projects].sort((a, b) => {
    const av = a[sortField] ?? "";
    const bv = b[sortField] ?? "";
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }
  function toggleAll() {
    setSelected(
      selected.length === sorted.length ? [] : sorted.map((p) => p._id || p.id),
    );
  }

  const COLS = [
    { key: "name", label: "Project", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
    { key: "members", label: "Team", sortable: false },
    { key: "progress", label: "Progress", sortable: true },
    { key: "dueDate", label: "Due Date", sortable: true },
    { key: "actions", label: "", sortable: false },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted }}
            />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-xl py-2 text-sm outline-none transition-all"
              style={{
                paddingLeft: "2.25rem",
                paddingRight: "0.875rem",
                backgroundColor: subtle,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = border)}
            />
          </div>
          {selected.length > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {selected.length} selected
            </span>
          )}
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            }}
          >
            <FiPlus size={15} /> New Project
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr
              style={{
                backgroundColor: headBg,
                borderBottom: `1px solid ${border}`,
              }}
            >
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selected.length === sorted.length && sorted.length > 0
                  }
                  onChange={toggleAll}
                  className="rounded"
                  style={{ accentColor: "#3b82f6" }}
                />
              </th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left"
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {col.label}
                    </span>
                    {col.sortable && (
                      <SortIcon
                        field={col.key}
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div
                        className="h-4 rounded-lg animate-pulse"
                        style={{
                          background: subtle,
                          width: j === 0 ? "1.5rem" : "80%",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    No projects found
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((project) => {
                const id = project._id || project.id;
                const isSelected = selected.includes(id);
                const status =
                  STATUS_CFG[project.status] || STATUS_CFG.planning;
                const priority =
                  PRIORITY_CFG[project.priority] || PRIORITY_CFG.medium;
                const members = project.members || [];
                const done = project.taskCounts?.done || 0;
                const total = project.taskCounts?.total || 0;
                const prog = project.progress ?? percentage(done, total);
                const overdue = isOverdue(project.dueDate);

                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: `1px solid ${border}`,
                      backgroundColor: isSelected
                        ? "rgba(59,130,246,0.05)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor = rowHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                        style={{ accentColor: "#3b82f6" }}
                      />
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5 min-w-[180px]">
                      <p
                        className="font-black text-sm leading-tight"
                        style={{ color: text, fontFamily: "Syne, sans-serif" }}
                      >
                        {project.name}
                      </p>
                      {project.description && (
                        <p
                          className="text-xs mt-0.5 line-clamp-1"
                          style={{
                            color: muted,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          {project.description}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{
                          color: status.color,
                          background: status.bg,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-bold capitalize"
                        style={{
                          color: priority.color,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        ● {project.priority || "—"}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-3.5">
                      <div className="flex -space-x-1.5">
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
                        {members.length === 0 && (
                          <span
                            className="text-xs"
                            style={{
                              color: muted,
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3.5 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: subtle }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${prog}%`,
                              background:
                                prog >= 100
                                  ? "linear-gradient(90deg,#10b981,#34d399)"
                                  : "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-black w-8 text-right"
                          style={{
                            color: text,
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {prog}%
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: overdue ? "#ef4444" : muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {project.dueDate ? formatDate(project.dueDate) : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        {[
                          {
                            icon: FiEye,
                            action: onView,
                            title: "View",
                            hoverColor: "#3b82f6",
                          },
                          {
                            icon: FiEdit2,
                            action: onEdit,
                            title: "Edit",
                            hoverColor: "#10b981",
                          },
                          {
                            icon: FiTrash2,
                            action: onDelete,
                            title: "Delete",
                            hoverColor: "#ef4444",
                          },
                        ].map(({ icon: Icon, action, title, hoverColor }) => (
                          <button
                            key={title}
                            onClick={() => action?.(project)}
                            title={title}
                            className="p-1.5 rounded-lg transition-all duration-150"
                            style={{ color: muted }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = hoverColor;
                              e.currentTarget.style.background = `${hoverColor}15`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = muted;
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {!isLoading && sorted.length > 0 && (
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: `1px solid ${border}` }}
        >
          <p
            className="text-xs"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            Showing{" "}
            <span style={{ color: text, fontWeight: 700 }}>
              {sorted.length}
            </span>{" "}
            project{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
