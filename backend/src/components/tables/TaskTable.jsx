import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatDate, isOverdue } from "../../utils/formateDate";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiPlus,
  FiAlertTriangle,
  FiFlag,
} from "react-icons/fi";

const STATUS_CFG = {
  todo: { label: "To Do", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
  in_progress: {
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  review: { label: "In Review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  done: { label: "Done", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};
const PRIORITY_CFG = {
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

export default function TaskTable({
  tasks = [],
  isLoading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  searchQuery,
  onSearchChange,
  onStatusChange,
}) {
  const { isDark } = useTheme();
  const [sortField, setSortField] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

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

  const filtered = tasks.filter(
    (t) => !statusFilter || t.status === statusFilter,
  );
  const sorted = [...filtered].sort((a, b) => {
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
      selected.length === sorted.length ? [] : sorted.map((t) => t._id || t.id),
    );
  }

  const COLS = [
    { key: "title", label: "Task", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "assignee", label: "Assignee", sortable: false },
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
        className="flex items-center flex-wrap gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          />
          <input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search tasks..."
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

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { value: "", label: "All" },
            ...Object.entries(STATUS_CFG).map(([k, v]) => ({
              value: k,
              label: v.label,
            })),
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background:
                  statusFilter === opt.value
                    ? opt.value
                      ? STATUS_CFG[opt.value]?.bg
                      : "rgba(59,130,246,0.12)"
                    : subtle,
                color:
                  statusFilter === opt.value
                    ? opt.value
                      ? STATUS_CFG[opt.value]?.color
                      : "#3b82f6"
                    : muted,
                border: `1px solid ${statusFilter === opt.value ? (opt.value ? STATUS_CFG[opt.value]?.color : "#3b82f6") : border}`,
              }}
            >
              {opt.label}
            </button>
          ))}
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

        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ml-auto flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            }}
          >
            <FiPlus size={15} /> Add Task
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
              Array.from({ length: 6 }).map((_, i) => (
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
                    No tasks found
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((task) => {
                const id = task._id || task.id;
                const isSelected = selected.includes(id);
                const status = STATUS_CFG[task.status] || STATUS_CFG.todo;
                const priority =
                  PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
                const PIcon = priority.icon;
                const assignee = task.assignee?.name || task.assignee || null;
                const overdue = isOverdue(task.dueDate);
                const tags = task.tags || [];

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
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                        style={{ accentColor: "#3b82f6" }}
                      />
                    </td>

                    {/* Title + tags */}
                    <td className="px-4 py-3.5 min-w-[200px]">
                      <p
                        className="font-black text-sm leading-tight"
                        style={{ color: text, fontFamily: "Syne, sans-serif" }}
                      >
                        {task.title}
                      </p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                              style={{
                                background: "rgba(59,130,246,0.10)",
                                color: "#3b82f6",
                                fontFamily: "DM Sans, sans-serif",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span
                              className="text-[10px]"
                              style={{ color: muted }}
                            >
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg w-fit"
                        style={{
                          color: priority.color,
                          background: priority.bg,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        <PIcon size={10} /> {priority.label}
                      </span>
                    </td>

                    {/* Status — clickable to change */}
                    <td className="px-4 py-3.5">
                      {onStatusChange ? (
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange(id, e.target.value);
                          }}
                          className="rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer border-0"
                          style={{
                            color: status.color,
                            background: status.bg,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          {Object.entries(STATUS_CFG).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : (
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
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: getAvatarColor(assignee) }}
                          >
                            {getInitials(assignee)}
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: text,
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          >
                            {assignee}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="text-xs"
                          style={{
                            color: muted,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3.5 min-w-[120px]">
                      {typeof task.progress === "number" ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: subtle }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${task.progress}%`,
                                background:
                                  "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                                transition: "width 0.5s ease",
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
                            {task.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: muted }}>
                          —
                        </span>
                      )}
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
                        {task.dueDate ? formatDate(task.dueDate) : "—"}
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
                            hoverColor: "#3b82f6",
                          },
                          {
                            icon: FiEdit2,
                            action: onEdit,
                            hoverColor: "#10b981",
                          },
                          {
                            icon: FiTrash2,
                            action: onDelete,
                            hoverColor: "#ef4444",
                          },
                        ].map(({ icon: Icon, action, hoverColor }) => (
                          <button
                            key={hoverColor}
                            onClick={() => action?.(task)}
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
            task{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
