import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiTag,
  FiMessageSquare,
  FiPaperclip,
  FiClock,
  FiCheckCircle,
  FiFlag,
  FiAlertTriangle,
} from "react-icons/fi";

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    icon: FiAlertTriangle,
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  high: {
    label: "High",
    icon: FiFlag,
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  medium: {
    label: "Medium",
    icon: FiFlag,
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  low: {
    label: "Low",
    icon: FiFlag,
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  review: {
    label: "In Review",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  done: {
    label: "Done",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
];
function getTagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
}

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-indigo-500",
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
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function isOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date();
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(task?.comments || []);

  if (!isOpen || !task) return null;

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const PriorityIcon = priority.icon;
  const assignees = task.assignees || (task.assignee ? [task.assignee] : []);
  const overdue = isOverdue(task.dueDate);

  function handleAddComment() {
    if (!newComment.trim()) return;
    setComments((c) => [
      ...c,
      {
        id: Date.now(),
        text: newComment.trim(),
        author: "You",
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewComment("");
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${priority.cls}`}
              >
                <PriorityIcon size={10} /> {priority.label}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}
              >
                {status.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {task.title}
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                title="Edit task"
              >
                <FiEdit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                title="Delete task"
              >
                <FiTrash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5 grid grid-cols-3 gap-6">
            {/* Main content */}
            <div className="col-span-2 space-y-5">
              {task.description && (
                <Section title="Description">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </Section>
              )}

              {/* Progress */}
              {typeof task.progress === "number" && (
                <Section title="Progress">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-10 text-right">
                      {task.progress}%
                    </span>
                  </div>
                </Section>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <Section title="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Comments */}
              <Section
                title={`Comments${comments.length ? ` (${comments.length})` : ""}`}
              >
                <div className="space-y-3">
                  {comments.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(c.author)}`}
                      >
                        {getInitials(c.author)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {c.author}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-2.5 pt-1">
                    <div className="w-7 h-7 rounded-full shrink-0 bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                      YO
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-300/30 transition-all"
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all active:scale-95 shrink-0"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            {/* Sidebar details */}
            <div className="col-span-1 space-y-5">
              {/* Status change */}
              {onStatusChange && (
                <Section title="Move to">
                  <div className="space-y-1">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => {
                          onStatusChange(task, key);
                          onClose();
                        }}
                        disabled={task.status === key}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                          ${
                            task.status === key
                              ? val.cls + " opacity-60 cursor-default"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Assignees */}
              <Section title="Assignees">
                {assignees.length > 0 ? (
                  <div className="space-y-2">
                    {assignees.map((a, i) => {
                      const name = a.name || a;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(name)}`}
                          >
                            {getInitials(name)}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Unassigned
                  </p>
                )}
              </Section>

              {/* Due Date */}
              <Section title="Due Date">
                <div
                  className={`flex items-center gap-1.5 text-sm font-medium ${overdue ? "text-red-500 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}
                >
                  <FiCalendar size={14} />
                  <span>{formatDate(task.dueDate)}</span>
                  {overdue && (
                    <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                      Overdue
                    </span>
                  )}
                </div>
              </Section>

              {/* Created */}
              {task.createdAt && (
                <Section title="Created">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <FiClock size={14} />
                    {formatDate(task.createdAt)}
                  </div>
                </Section>
              )}

              {/* Attachments */}
              {task.attachmentsCount > 0 && (
                <Section title="Attachments">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <FiPaperclip size={14} /> {task.attachmentsCount} file(s)
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
