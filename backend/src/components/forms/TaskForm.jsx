import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { validateTaskForm } from "../../utils/validators";
import { formatDateInput } from "../../utils/formateDate";
import {
  FiType,
  FiAlignLeft,
  FiCalendar,
  FiUser,
  FiTag,
  FiX,
  FiSave,
} from "react-icons/fi";

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    color: "#64748b",
    bg: "rgba(100,116,139,0.10)",
  },
  {
    value: "medium",
    label: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    value: "high",
    label: "High",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
  },
  {
    value: "critical",
    label: "Critical",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
];
const STATUSES = [
  { value: "todo", label: "To Do", color: "#64748b" },
  { value: "in_progress", label: "In Progress", color: "#3b82f6" },
  { value: "review", label: "In Review", color: "#f59e0b" },
  { value: "done", label: "Done", color: "#10b981" },
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
  assignee: "",
  tags: [],
  progress: 0,
};

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  teamMembers = [],
  projects = [],
}) {
  const { isDark } = useTheme();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        status: initialData.status || "todo",
        dueDate: initialData.dueDate
          ? formatDateInput(initialData.dueDate)
          : "",
        assignee: initialData.assignee?._id || initialData.assignee || "",
        tags: initialData.tags || [],
        progress: initialData.progress ?? 0,
        project: initialData.project?._id || initialData.project || "",
      });
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
  });

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 6) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateTaskForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit?.(form);
  }

  function Label({ children }) {
    return (
      <label
        className="block text-xs font-bold mb-1.5"
        style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
      >
        {children}
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <Label>Task Title *</Label>
        <div className="relative">
          <FiType
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          />
          <input
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setErrors((er) => ({ ...er, title: "" }));
            }}
            placeholder="What needs to be done?"
            autoFocus
            style={{ ...inputStyle("title"), paddingLeft: "2.5rem" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = errors.title ? "#ef4444" : border)
            }
          />
        </div>
        {errors.title && (
          <p
            className="text-xs mt-1"
            style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
          >
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Add more details about this task..."
          rows={3}
          style={{ ...inputStyle("description"), resize: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = border)}
        />
      </div>

      {/* Priority */}
      <div>
        <Label>Priority *</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
              className="py-2 rounded-xl text-xs font-bold transition-all duration-150"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: form.priority === p.value ? p.bg : subtle,
                border: `1px solid ${form.priority === p.value ? p.color : border}`,
                color: form.priority === p.value ? p.color : muted,
                boxShadow:
                  form.priority === p.value ? `0 2px 8px ${p.color}30` : "none",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <Label>Status *</Label>
        <div className="grid grid-cols-4 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s.value }))}
              className="py-2 rounded-xl text-xs font-bold transition-all duration-150"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: form.status === s.value ? `${s.color}15` : subtle,
                border: `1px solid ${form.status === s.value ? s.color : border}`,
                color: form.status === s.value ? s.color : muted,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due Date + Assignee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Due Date</Label>
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
        <div>
          <Label>Assignee</Label>
          <div className="relative">
            <FiUser
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted }}
            />
            {teamMembers.length > 0 ? (
              <select
                value={form.assignee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee: e.target.value }))
                }
                style={{
                  ...inputStyle("assignee"),
                  paddingLeft: "2.5rem",
                  cursor: "pointer",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.assignee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee: e.target.value }))
                }
                placeholder="Assignee name"
                style={{ ...inputStyle("assignee"), paddingLeft: "2.5rem" }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Project (if multiple projects) */}
      {projects.length > 0 && (
        <div>
          <Label>Project</Label>
          <select
            value={form.project || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, project: e.target.value }))
            }
            style={{ ...inputStyle("project"), cursor: "pointer" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = border)}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            className="text-xs font-bold"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            Progress
          </label>
          <span
            className="text-xs font-black"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {form.progress}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) =>
            setForm((f) => ({ ...f, progress: Number(e.target.value) }))
          }
          className="w-full h-2 rounded-full outline-none cursor-pointer appearance-none"
          style={{ accentColor: "#3b82f6" }}
        />
        <div className="flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm((f) => ({ ...f, progress: v }))}
              className="text-[10px] font-semibold transition-colors"
              style={{
                color: form.progress === v ? "#3b82f6" : muted,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
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
            placeholder={form.tags.length < 6 ? "Add tag, press Enter..." : ""}
            disabled={form.tags.length >= 6}
            className="flex-1 min-w-[100px] text-xs outline-none bg-transparent"
            style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
          />
        </div>
      </div>

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
              ? "Update Task"
              : "Create Task"}
        </button>
      </div>
    </form>
  );
}
