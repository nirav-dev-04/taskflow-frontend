import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { validateProjectForm } from "../../utils/validators";
import { formatDateInput } from "../../utils/formateDate";
import {
  FiFolder,
  FiAlignLeft,
  FiCalendar,
  FiUsers,
  FiTag,
  FiX,
  FiSave,
} from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
const STATUS_COLORS = {
  planning: "#06b6d4",
  active: "#10b981",
  on_hold: "#f59e0b",
  completed: "#3b82f6",
  cancelled: "#ef4444",
};
const PRIORITY_COLORS = { low: "#64748b", medium: "#f59e0b", high: "#ef4444" };

const DEFAULT_FORM = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  dueDate: "",
  tags: [],
};

function FieldLabel({ label, muted }) {
  return (
    <label
      className="block text-xs font-bold mb-1.5"
      style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
    >
      {label}
    </label>
  );
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  teamMembers = [],
}) {
  const { isDark } = useTheme();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "planning",
        priority: initialData.priority || "medium",
        dueDate: initialData.dueDate
          ? formatDateInput(initialData.dueDate)
          : "",
        tags: initialData.tags || [],
      });
      setSelectedMembers(initialData.members || []);
    }
  }, [initialData]);

  const inputStyle = (field) => ({
    width: "100%",
    borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem",
    backgroundColor: subtle,
    border: `1px solid ${errors[field] ? "#ef4444" : border}`,
    color: text,
    fontSize: "0.875rem",
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  });

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  }

  function toggleMember(member) {
    const id = member._id || member.id;
    setSelectedMembers((prev) =>
      prev.some((m) => (m._id || m.id) === id)
        ? prev.filter((m) => (m._id || m.id) !== id)
        : [...prev, member],
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateProjectForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit?.({ ...form, members: selectedMembers.map((m) => m._id || m.id) });
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
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <FieldLabel label="Project Name *" muted={muted} />
        <div className="relative">
          <FiFolder
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          />
          <input
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setErrors((er) => ({ ...er, name: "" }));
            }}
            placeholder="Enter project name..."
            style={{ ...inputStyle("name"), paddingLeft: "2.5rem" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = errors.name ? "#ef4444" : border)
            }
          />
        </div>
        {errors.name && (
          <p
            className="text-xs mt-1"
            style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <FieldLabel label="Description" muted={muted} />
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="What is this project about?"
          rows={3}
          style={{ ...inputStyle("description"), resize: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = border)}
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Status *" muted={muted} />
          <div className="grid grid-cols-1 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: opt.value }))}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  background:
                    form.status === opt.value
                      ? `${STATUS_COLORS[opt.value]}18`
                      : subtle,
                  border: `1px solid ${form.status === opt.value ? STATUS_COLORS[opt.value] : border}`,
                  color:
                    form.status === opt.value
                      ? STATUS_COLORS[opt.value]
                      : muted,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: STATUS_COLORS[opt.value] }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Priority */}
          <div>
            <FieldLabel label="Priority *" muted={muted} />
            <div className="flex gap-1.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, priority: opt.value }))
                  }
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    background:
                      form.priority === opt.value
                        ? `${PRIORITY_COLORS[opt.value]}18`
                        : subtle,
                    border: `1px solid ${form.priority === opt.value ? PRIORITY_COLORS[opt.value] : border}`,
                    color:
                      form.priority === opt.value
                        ? PRIORITY_COLORS[opt.value]
                        : muted,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <FieldLabel label="Due Date" muted={muted} />
            <div className="relative">
              <FiCalendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                style={{ ...inputStyle("dueDate"), paddingLeft: "2.5rem" }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <FieldLabel label="Tags" muted={muted} />
        <div
          className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl min-h-[44px]"
          style={{ backgroundColor: subtle, border: `1px solid ${border}` }}
        >
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    tags: f.tags.filter((t) => t !== tag),
                  }))
                }
              >
                <FiX size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder={form.tags.length < 8 ? "Add tag, press Enter..." : ""}
            disabled={form.tags.length >= 8}
            className="flex-1 min-w-[100px] text-xs outline-none bg-transparent"
            style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
          />
        </div>
      </div>

      {/* Members */}
      {teamMembers.length > 0 && (
        <div>
          <FieldLabel label="Team Members" muted={muted} />
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => {
              const id = member._id || member.id;
              const isSelected = selectedMembers.some(
                (m) => (m._id || m.id) === id,
              );
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleMember(member)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    background: isSelected ? "rgba(59,130,246,0.12)" : subtle,
                    border: `1px solid ${isSelected ? "#3b82f6" : border}`,
                    color: isSelected ? "#3b82f6" : muted,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                    style={{ background: getAvatarColor(member.name) }}
                  >
                    {getInitials(member.name)}
                  </div>
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-end gap-3 pt-2"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              color: muted,
              background: subtle,
              border: `1px solid ${border}`,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
          }}
        >
          <FiSave size={15} />
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Project"
              : "Create Project"}
        </button>
      </div>
    </form>
  );
}
