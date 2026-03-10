import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/formateDate";
import {
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiPlus,
  FiShield,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

const ROLE_CFG = {
  admin: { label: "Admin", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  manager: { label: "Manager", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  employee: {
    label: "Employee",
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

export default function UserTable({
  users = [],
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onActivate,
  onDeactivate,
  onChangeRole,
  searchQuery,
  onSearchChange,
}) {
  const { isDark } = useTheme();
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

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

  const filtered = users.filter((u) => !roleFilter || u.role === roleFilter);
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
      selected.length === sorted.length ? [] : sorted.map((u) => u._id || u.id),
    );
  }

  const COLS = [
    { key: "name", label: "User", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "isActive", label: "Status", sortable: true },
    { key: "createdAt", label: "Joined", sortable: true },
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
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center flex-wrap gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        {/* Search — FIX: min-w-[180px] → min-w-45 */}
        <div className="relative flex-1 min-w-45 max-w-xs">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          />
          <input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search users..."
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

        {/* Role filter pills */}
        <div className="flex items-center gap-1.5">
          {[
            { value: "", label: "All Roles" },
            ...Object.entries(ROLE_CFG).map(([k, v]) => ({
              value: k,
              label: v.label,
            })),
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background:
                  roleFilter === opt.value
                    ? opt.value
                      ? ROLE_CFG[opt.value]?.bg
                      : "rgba(59,130,246,0.12)"
                    : subtle,
                color:
                  roleFilter === opt.value
                    ? opt.value
                      ? ROLE_CFG[opt.value]?.color
                      : "#3b82f6"
                    : muted,
                border: `1px solid ${
                  roleFilter === opt.value
                    ? opt.value
                      ? ROLE_CFG[opt.value]?.color
                      : "#3b82f6"
                    : border
                }`,
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

        {/* FIX: flex-shrink-0 → shrink-0 */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ml-auto shrink-0"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            }}
          >
            <FiPlus size={15} /> Add User
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
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
                  {Array.from({ length: 7 }).map((_, j) => (
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
                <td colSpan={7} className="px-4 py-16 text-center">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    No users found
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((user) => {
                const id = user._id || user.id;
                const isSelected = selected.includes(id);
                const role = ROLE_CFG[user.role] || ROLE_CFG.employee;

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

                    {/* User — FIX: flex-shrink-0 → shrink-0 */}
                    <td className="px-4 py-3.5 min-w-50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden"
                          style={{
                            background: user.avatar
                              ? "transparent"
                              : getAvatarColor(user.name),
                          }}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <p
                            className="font-black text-sm"
                            style={{
                              color: text,
                              fontFamily: "Syne, sans-serif",
                            }}
                          >
                            {user.name}
                          </p>
                          {user.location && (
                            <p
                              className="text-[11px]"
                              style={{
                                color: muted,
                                fontFamily: "DM Sans, sans-serif",
                              }}
                            >
                              {user.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role — clickable to change */}
                    <td className="px-4 py-3.5">
                      {onChangeRole ? (
                        <select
                          value={user.role}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangeRole(id, e.target.value);
                          }}
                          className="rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer border-0"
                          style={{
                            color: role.color,
                            background: role.bg,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          {Object.entries(ROLE_CFG).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg w-fit"
                          style={{
                            color: role.color,
                            background: role.bg,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          <FiShield size={10} /> {role.label}
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs"
                        style={{
                          color: muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {user.email}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          user.isActive ? onDeactivate?.(id) : onActivate?.(id);
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          color: user.isActive ? "#10b981" : "#ef4444",
                          background: user.isActive
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(239,68,68,0.12)",
                          fontFamily: "DM Sans, sans-serif",
                          cursor:
                            onActivate || onDeactivate ? "pointer" : "default",
                        }}
                      >
                        {user.isActive ? (
                          <FiUserCheck size={11} />
                        ) : (
                          <FiUserX size={11} />
                        )}
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs"
                        style={{
                          color: muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
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
                            onClick={() => action?.(user)}
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
            user{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
