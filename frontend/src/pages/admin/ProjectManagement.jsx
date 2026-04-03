import { useState, useEffect, useRef } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import {
  FiSearch, FiPlus, FiTrash2, FiUsers, FiCalendar,
  FiCheckCircle, FiX, FiArrowLeft, FiUserPlus, FiUserMinus,
  FiClipboard, FiSend, FiMessageSquare,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  critical: { color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
};

const STATUS_CONFIG = {
  planning:  { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  active:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  on_hold:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  completed: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const ACTION_CONFIG = {
  created:           { icon: "✨", color: "#6c63ff" },
  status_changed:    { icon: "🔄", color: "#00d4aa" },
  commented:         { icon: "💬", color: "#3b82f6" },
  subtask_added:     { icon: "➕", color: "#a78bfa" },
  subtask_completed: { icon: "✅", color: "#22c55e" },
  updated:           { icon: "✏️", color: "#f59e0b" },
  time_logged:       { icon: "⏱️", color: "#ff6b35" },
};

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];
const getColor = (i) => COLORS[i % COLORS.length];

const Avatar = ({ name = "?", size = 32, color = "#6c63ff" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}, ${color}aa)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 700, fontSize: size * 0.38,
    fontFamily: "Syne, sans-serif", flexShrink: 0,
  }}>
    {name[0]?.toUpperCase()}
  </div>
);

// ── Render comment text with @mention highlights ──────────────────────────────
const CommentText = ({ text, mentions = [], textColor, mentionColor = "#6c63ff" }) => {
  if (!mentions.length) return <span style={{ color: textColor }}>{text}</span>;
  const parts = text.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          return <span key={i} style={{ color: mentionColor, fontWeight: 600, backgroundColor: `${mentionColor}15`, padding: "0 3px", borderRadius: 3 }}>{part}</span>;
        }
        return <span key={i} style={{ color: textColor }}>{part}</span>;
      })}
    </span>
  );
};

// ── Comments Section Component ────────────────────────────────────────────────
const CommentsSection = ({ taskId, allUsers, members, isDark }) => {
  const [comments, setComments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [commentText, setCommentText] = useState("");
  const [mentions, setMentions]       = useState([]);
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [sending, setSending]         = useState(false);
  const inputRef = useRef(null);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  // Get member objects
  const memberUsers = members.map(m => typeof m === "object" ? m : allUsers.find(u => u._id === m)).filter(Boolean);
  const filteredMentions = memberUsers.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()));

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        setComments((res.task || res).comments || []);
      } catch { setComments([]); }
      finally { setLoading(false); }
    };
    fetchComments();
  }, [taskId]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCommentText(val);
    // Detect @ trigger
    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setShowMention(true);
      setMentionQuery("");
    } else if (lastAt !== -1 && val.slice(lastAt + 1).match(/^\w*$/)) {
      setShowMention(true);
      setMentionQuery(val.slice(lastAt + 1));
    } else {
      setShowMention(false);
    }
  };

  const insertMention = (user) => {
    const lastAt = commentText.lastIndexOf("@");
    const before = commentText.slice(0, lastAt);
    const newText = `${before}@${user.name} `;
    setCommentText(newText);
    setShowMention(false);
    setMentionQuery("");
    if (!mentions.find(m => m === user._id)) setMentions(prev => [...prev, user._id]);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { text: commentText, mentions });
      const newComment = res.comment || res;
      setComments(prev => [...prev, newComment]);
      setCommentText(""); setMentions([]); setShowMention(false);
      toast.success("Comment added!");
    } catch { toast.error("Failed to add comment"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ marginTop: 8 }}>
      {/* Comment list */}
      {loading ? (
        <p style={{ color: muted, fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", padding: "8px 0" }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: muted, fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", padding: "8px 0" }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {comments.map((c, i) => {
            const u = typeof c.user === "object" ? c.user : allUsers.find(u => u._id === c.user);
            return (
              <div key={c._id || i} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 10, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                <Avatar name={u?.name || "?"} size={28} color={getColor(i)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>{u?.name || "Unknown"}</span>
                    <span style={{ fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>
                    <CommentText text={c.text} mentions={c.mentions || []} textColor={muted} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div style={{ position: "relative" }}>
        {/* @mention dropdown */}
        {showMention && filteredMentions.length > 0 && (
          <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 10, zIndex: 10, maxHeight: 140, overflow: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", marginBottom: 4 }}>
            {filteredMentions.map((u, i) => (
              <div key={u._id}
                onClick={() => insertMention(u)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderBottom: i < filteredMentions.length - 1 ? `1px solid ${border}` : "none" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e1e30" : "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <Avatar name={u.name} size={22} color={getColor(i)} />
                <span style={{ fontSize: 12, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{u.name}</span>
                <span style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>({u.role})</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={commentText}
            onChange={handleTextChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } if (e.key === "Escape") setShowMention(false); }}
            placeholder="Add a comment... (type @ to mention)"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: inputBg, color: text, fontSize: 12, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
          <button onClick={handleSend} disabled={sending || !commentText.trim()}
            style={{ padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #3b82f6, #6c63ff)", color: "white", display: "flex", alignItems: "center", opacity: sending || !commentText.trim() ? 0.6 : 1 }}>
            <FiSend size={14} />
          </button>
        </div>
        {mentions.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {mentions.map(id => {
              const u = allUsers.find(u => u._id === id);
              return u ? (
                <span key={id} style={{ fontSize: 10, color: "#6c63ff", backgroundColor: "rgba(108,99,255,0.1)", padding: "2px 8px", borderRadius: 10, fontFamily: "DM Sans, sans-serif" }}>
                  @{u.name}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Project Detail Modal ──────────────────────────────────────────────────────
const ProjectDetail = ({ project, allUsers, isDark, onClose, onRefresh }) => {
  const [tasks, setTasks]                   = useState([]);
  const [members, setMembers]               = useState(project.members || []);
  const [loadingTasks, setLoadingTasks]     = useState(true);
  const [showAddTask, setShowAddTask]       = useState(false);
  const [showAddMember, setShowAddMember]   = useState(false);
  const [newTask, setNewTask]               = useState({ title: "", priority: "medium", dueDate: "", assignees: [], dependencies: [] });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expandedTask, setExpandedTask]     = useState(null);
  const [showAddSubtask, setShowAddSubtask] = useState(null);
  const [showComments, setShowComments]     = useState(null);
  const [newSubtask, setNewSubtask]         = useState({ title: "", assignee: "" });
  const [activeTab, setActiveTab]           = useState("tasks");
  const [activityLog, setActivityLog]       = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const cardBg    = isDark ? "#12121f" : "#ffffff";
  const overlayBg = isDark ? "#0a0a0f" : "#f1f5f9";
  const border    = isDark ? "#1e1e30" : "#e2e8f0";
  const text      = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted     = isDark ? "#6b6b8a" : "#64748b";
  const inputBg   = isDark ? "#0d0d18" : "#f8fafc";

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.get(`/tasks?project=${project._id}`);
      setTasks(res.tasks || res || []);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoadingTasks(false); }
  };

  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await api.get(`/tasks?project=${project._id}`);
      const allTasks = res.tasks || res || [];
      const merged = allTasks
        .flatMap(t => (t.activityLog || []).map(a => ({ ...a, taskTitle: t.title, taskId: t._id })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivityLog(merged);
    } catch { setActivityLog([]); }
    finally { setLoadingActivity(false); }
  };

  useEffect(() => { fetchTasks(); }, [project._id]);

  const memberIds  = members.map(m => m._id || m);
  const nonMembers = allUsers.filter(u => !memberIds.includes(u._id) && u.role === "employee");

  const handleAddMember = async () => {
    if (!selectedUserId) { toast.error("Select a user"); return; }
    try {
      const res = await api.post(`/projects/${project._id}/members`, { userId: selectedUserId });
      setMembers((res.project || res).members || []);
      setSelectedUserId(""); setShowAddMember(false);
      toast.success("Member added!"); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add member"); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const res = await api.delete(`/projects/${project._id}/members/${userId}`);
      setMembers((res.project || res).members || []);
      toast.success("Member removed"); onRefresh();
    } catch { toast.error("Failed to remove member"); }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) { toast.error("Task title required"); return; }
    try {
      await api.post("/tasks", { title: newTask.title, priority: newTask.priority, dueDate: newTask.dueDate || undefined, assignees: newTask.assignees, dependencies: newTask.dependencies || [], project: project._id });
      toast.success("Task created!");
      setNewTask({ title: "", priority: "medium", dueDate: "", assignees: [], dependencies: [] });
      setShowAddTask(false); fetchTasks(); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create task"); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${taskId}`); toast.success("Task deleted"); fetchTasks(); onRefresh(); }
    catch { toast.error("Failed to delete task"); }
  };

  const handleAddSubtask = async (taskId) => {
    if (!newSubtask.title.trim()) { toast.error("Subtask title required"); return; }
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtask.title, assignee: newSubtask.assignee || undefined });
      toast.success("Subtask added!");
      setNewSubtask({ title: "", assignee: "" }); setShowAddSubtask(null); fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add subtask"); }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: res.subtasks || t.subtasks, progress: res.progress ?? t.progress, status: res.status || t.status } : t));
    } catch { toast.error("Failed to update subtask"); }
  };

  const handleDeleteSubtask = async (taskId, subtaskId) => {
    try { await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`); toast.success("Subtask deleted"); fetchTasks(); }
    catch { toast.error("Failed to delete subtask"); }
  };

  const statusLabel = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
  const statusColor = { todo: "#6b6b8a", in_progress: "#3b82f6", review: "#f59e0b", done: "#22c55e" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: overlayBg, borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", border: `1px solid ${border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted, display: "flex" }}><FiArrowLeft size={20} /></button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 18, fontWeight: 700 }}>{project.name}</h2>
            <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>
              Manager: {project.manager?.name || "Unassigned"} &nbsp;•&nbsp;
              <span style={{ color: STATUS_CONFIG[project.status]?.color }}>{project.status?.replace("_", " ")}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><FiX size={20} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Members ── */}
          <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <FiUsers size={16} /> Members ({members.length})
              </h3>
              <button onClick={() => setShowAddMember(!showAddMember)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6c63ff, #8b85ff)", color: "white", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                <FiUserPlus size={13} /> Add Member
              </button>
            </div>
            {showAddMember && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: inputBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}>
                  <option value="">Select employee to add...</option>
                  {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <button onClick={handleAddMember} style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Add</button>
                <button onClick={() => setShowAddMember(false)} style={{ padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted }}><FiX size={14} /></button>
              </div>
            )}
            {members.length === 0 ? (
              <p style={{ color: muted, fontSize: 13, fontFamily: "DM Sans, sans-serif", textAlign: "center", padding: "12px 0" }}>No members yet. Click "Add Member" to add employees!</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {members.map((m, i) => {
                  const member = typeof m === "object" ? m : allUsers.find(u => u._id === m);
                  if (!member) return null;
                  return (
                    <div key={member._id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 20, backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", border: `1px solid ${border}` }}>
                      <Avatar name={member.name} size={24} color={getColor(i)} />
                      <span style={{ fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif" }}>{member.name}</span>
                      <span style={{ fontSize: 11, color: muted }}>({member.role})</span>
                      <button onClick={() => handleRemoveMember(member._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: 0 }}>
                        <FiUserMinus size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Tab Switcher ── */}
          <div style={{ display: "flex", gap: 8 }}>
            {["tasks", "activity"].map(tab => (
              <button key={tab}
                onClick={() => { setActiveTab(tab); if (tab === "activity") fetchActivity(); }}
                style={{ padding: "6px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600, backgroundColor: activeTab === tab ? (tab === "activity" ? "#6c63ff" : "#ff6b35") : (isDark ? "#1e1e30" : "#e2e8f0"), color: activeTab === tab ? "white" : muted, transition: "all 0.2s" }}>
                {tab === "tasks" ? `📋 Tasks (${tasks.length})` : "📜 Activity"}
              </button>
            ))}
          </div>

          {/* ── Activity Tab ── */}
          {activeTab === "activity" && (
            <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
              <h3 style={{ margin: "0 0 16px", fontFamily: "Syne, sans-serif", color: text, fontSize: 15 }}>Project Activity</h3>
              {loadingActivity ? (
                <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>Loading activity...</p>
              ) : activityLog.length === 0 ? (
                <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13, padding: "20px 0" }}>No activity yet</p>
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {activityLog.map((entry, i) => {
                      const cfg = ACTION_CONFIG[entry.action] || { icon: "📝", color: muted };
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, paddingLeft: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: `${cfg.color}20`, border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, fontSize: 12 }}>
                            {cfg.icon}
                          </div>
                          <div style={{ flex: 1, paddingTop: 2 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>{entry.user?.name || "Someone"}</span>
                              <span style={{ fontSize: 11, color: muted }}>{timeAgo(entry.createdAt)}</span>
                              <span style={{ fontSize: 10, color: "#6c63ff", backgroundColor: "rgba(108,99,255,0.1)", padding: "1px 6px", borderRadius: 4, fontFamily: "DM Sans, sans-serif" }}>{entry.taskTitle}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>{entry.detail || entry.action}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tasks Tab ── */}
          {activeTab === "tasks" && (
            <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiClipboard size={16} /> Tasks ({tasks.length})
                </h3>
                <button onClick={() => setShowAddTask(!showAddTask)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                  <FiPlus size={13} /> Add Task
                </button>
              </div>

              {/* Add Task Form */}
              {showAddTask && (
                <div style={{ backgroundColor: inputBg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title *"
                      style={{ gridColumn: "1/-1", padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}>
                      {["low", "medium", "high", "critical"].map(p => <option key={p}>{p}</option>)}
                    </select>
                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                    <select style={{ gridColumn: "1/-1", padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}
                      onChange={e => { const id = e.target.value; if (id && !newTask.assignees.includes(id)) setNewTask(prev => ({ ...prev, assignees: [...prev.assignees, id] })); e.target.value = ""; }}>
                      <option value="">Assign to member...</option>
                      {members.map((m, i) => { const member = typeof m === "object" ? m : allUsers.find(u => u._id === m); return member ? <option key={member._id} value={member._id}>{member.name}</option> : null; })}
                    </select>
                    {newTask.assignees.length > 0 && (
                      <div style={{ gridColumn: "1/-1", display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {newTask.assignees.map(id => { const u = allUsers.find(u => u._id === id); return u ? (<span key={id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", fontSize: 12, color: text, fontFamily: "DM Sans, sans-serif" }}>{u.name}<button onClick={() => setNewTask(prev => ({ ...prev, assignees: prev.assignees.filter(a => a !== id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex" }}><FiX size={11} /></button></span>) : null; })}
                      </div>
                    )}
                    <select style={{ gridColumn: "1/-1", padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}
                      onChange={e => { const id = e.target.value; if (id && !(newTask.dependencies || []).includes(id)) setNewTask(prev => ({ ...prev, dependencies: [...(prev.dependencies || []), id] })); e.target.value = ""; }}>
                      <option value="">🔗 Add dependency (optional)...</option>
                      {tasks.filter(t => !(newTask.dependencies || []).includes(t._id)).map(t => (<option key={t._id} value={t._id}>Blocked by: {t.title}</option>))}
                    </select>
                    {(newTask.dependencies || []).length > 0 && (
                      <div style={{ gridColumn: "1/-1", display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(newTask.dependencies || []).map(id => { const dep = tasks.find(t => t._id === id); return dep ? (<span key={id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, backgroundColor: "rgba(239,68,68,0.1)", fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif", border: "1px solid rgba(239,68,68,0.2)" }}>🔗 {dep.title}<button onClick={() => setNewTask(prev => ({ ...prev, dependencies: prev.dependencies.filter(d => d !== id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex" }}><FiX size={11} /></button></span>) : null; })}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCreateTask} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Create Task</button>
                    <button onClick={() => setShowAddTask(false)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              )}

              {loadingTasks ? (
                <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13, padding: "12px 0" }}>No tasks yet. Click "Add Task" to create the first one!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tasks.map(task => {
                    const pc         = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const sc         = statusColor[task.status] || "#6b6b8a";
                    const subtasks   = task.subtasks || [];
                    const doneSubs   = subtasks.filter(s => s.isCompleted).length;
                    const isExpanded = expandedTask === task._id;
                    const isCommentOpen = showComments === task._id;
                    const commentCount = (task.comments || []).length;
                    return (
                      <div key={task._id} style={{ borderRadius: 12, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}`, overflow: "hidden" }}>

                        {/* Task Row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: sc, flexShrink: 0 }} />
                          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandedTask(isExpanded ? null : task._id)}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                              <p style={{ margin: 0, fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{task.title}</p>
                              {(task.dependencies || []).length > 0 && (task.dependencies || []).some(d => { const dep = tasks.find(t => t._id === (d._id || d)); return dep && dep.status !== "done"; }) && (
                                <span style={{ fontSize: 10, color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "1px 6px", borderRadius: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 600, border: "1px solid rgba(239,68,68,0.2)" }}>🔒 BLOCKED</span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                              <span style={{ fontSize: 11, color: sc }}>{statusLabel[task.status] || task.status}</span>
                              <span style={{ fontSize: 11, color: pc.color }}>{task.priority}</span>
                              {task.dueDate && <span style={{ fontSize: 11, color: muted }}>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                              {subtasks.length > 0 && <span style={{ fontSize: 11, color: "#6c63ff", fontWeight: 600 }}>✓ {doneSubs}/{subtasks.length} subtasks</span>}
                            </div>
                            {subtasks.length > 0 && (
                              <div style={{ marginTop: 5, height: 3, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.round((doneSubs / subtasks.length) * 100)}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 4 }} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex" }}>
                            {(task.assignees || []).slice(0, 3).map((a, i) => { const u = typeof a === "object" ? a : allUsers.find(u => u._id === a); return u ? <Avatar key={i} name={u.name} size={24} color={getColor(i)} /> : null; })}
                          </div>
                          {/* Comment button */}
                          <button onClick={() => setShowComments(isCommentOpen ? null : task._id)}
                            style={{ display: "flex", alignItems: "center", gap: 3, background: isCommentOpen ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)", border: "none", cursor: "pointer", color: "#3b82f6", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                            <FiMessageSquare size={11} />
                            {commentCount > 0 && <span>{commentCount}</span>}
                          </button>
                          <button onClick={() => setShowAddSubtask(showAddSubtask === task._id ? null : task._id)}
                            style={{ background: "rgba(108,99,255,0.1)", border: "none", cursor: "pointer", color: "#6c63ff", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                            + Sub
                          </button>
                          <button onClick={() => handleDeleteTask(task._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex" }}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>

                        {/* Comments Section */}
                        {isCommentOpen && (
                          <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${border}`, backgroundColor: isDark ? "#12121f" : "#f8fafc" }}>
                            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#3b82f6", fontFamily: "DM Sans, sans-serif" }}>💬 Comments</p>
                            <CommentsSection taskId={task._id} allUsers={allUsers} members={members} isDark={isDark} />
                          </div>
                        )}

                        {/* Add Subtask Form */}
                        {showAddSubtask === task._id && (
                          <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${border}`, backgroundColor: isDark ? "#12121f" : "#f1f5f9" }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                              <input value={newSubtask.title} onChange={e => setNewSubtask({ ...newSubtask, title: e.target.value })}
                                placeholder="Subtask title *" onKeyDown={e => e.key === "Enter" && handleAddSubtask(task._id)}
                                style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 12, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                              <select value={newSubtask.assignee} onChange={e => setNewSubtask({ ...newSubtask, assignee: e.target.value })}
                                style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 12, fontFamily: "DM Sans, sans-serif", outline: "none" }}>
                                <option value="">Assign to...</option>
                                {members.map((m, i) => { const member = typeof m === "object" ? m : allUsers.find(u => u._id === m); return member ? <option key={member._id} value={member._id}>{member.name}</option> : null; })}
                              </select>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleAddSubtask(task._id)} style={{ flex: 1, padding: "5px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6c63ff, #8b85ff)", color: "white", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Add Subtask</button>
                              <button onClick={() => setShowAddSubtask(null)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontSize: 12 }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Subtask List */}
                        {(isExpanded || showAddSubtask === task._id) && subtasks.length > 0 && (
                          <div style={{ padding: "4px 14px 10px", borderTop: `1px solid ${border}` }}>
                            {subtasks.map((sub, si) => {
                              const assignedUser = typeof sub.assignee === "object" ? sub.assignee : allUsers.find(u => u._id === sub.assignee);
                              return (
                                <div key={sub._id || si} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: si < subtasks.length - 1 ? `1px dashed ${border}` : "none" }}>
                                  <button onClick={() => handleToggleSubtask(task._id, sub._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0, fontSize: 14 }}>
                                    {sub.isCompleted ? "✅" : "⬜"}
                                  </button>
                                  <span style={{ flex: 1, fontSize: 12, color: sub.isCompleted ? muted : text, fontFamily: "DM Sans, sans-serif", textDecoration: sub.isCompleted ? "line-through" : "none" }}>{sub.title}</span>
                                  {assignedUser && <Avatar name={assignedUser.name} size={20} color={getColor(si)} />}
                                  {sub.isCompleted && sub.completedBy && <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "DM Sans, sans-serif" }}>✓ done</span>}
                                  <button onClick={() => handleDeleteSubtask(task._id, sub._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: 0 }}><FiX size={12} /></button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProjectManagement = () => {
  const { isDark } = useTheme();
  const [projects, setProjects]               = useState([]);
  const [allUsers, setAllUsers]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [filterStatus, setFilterStatus]       = useState("All");
  const [showAdd, setShowAdd]                 = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", managerId: "", dueDate: "", priority: "medium" });

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";
  const managers = allUsers.filter(u => u.role === "manager" || u.role === "admin");

  const fetchProjects = async () => {
    try { setLoading(true); const res = await api.get("/projects"); setProjects(res.projects || res || []); }
    catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await api.get("/users"); setAllUsers(res.users || res || []); } catch {}
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus.toLowerCase().replace("-", "_");
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    if (!newProject.name) { toast.error("Project name required"); return; }
    try {
      await api.post("/projects", { name: newProject.name, description: newProject.description, manager: newProject.managerId || undefined, dueDate: newProject.dueDate || undefined, priority: newProject.priority });
      toast.success("Project created!");
      setNewProject({ name: "", description: "", managerId: "", dueDate: "", priority: "medium" });
      setShowAdd(false); fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create project"); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try { await api.delete(`/projects/${id}`); toast.success("Project deleted!"); fetchProjects(); }
    catch { toast.error("Failed to delete project"); }
  };

  return (
    <PageWrapper title="Project Management">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
          {["All", "Planning", "Active", "On-Hold", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: cardBg, border: `1px solid #ff6b3550`, animation: "slideUp 0.3s ease" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project Name *" className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <input value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.managerId} onChange={e => setNewProject({ ...newProject, managerId: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              <option value="">Select Manager</option>
              {managers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={newProject.dueDate} onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.priority} onChange={e => setNewProject({ ...newProject, priority: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              {["high", "medium", "low"].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif" }}>Create Project</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105" style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading projects...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const color    = getColor(i);
            const status   = project.status || "planning";
            const priority = project.priority || "medium";
            const sc = STATUS_CONFIG[status]     || STATUS_CONFIG.planning;
            const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
            return (
              <div key={project._id} onClick={() => setSelectedProject(project)}
                className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.08}s both` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontFamily: "Syne, sans-serif" }}>{project.name[0]}</div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{project.name}</h3>
                      <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>by {project.manager?.name || "Unassigned"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif", backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>Click to open</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize" style={{ backgroundColor: sc.bg, color: sc.color, fontFamily: "DM Sans, sans-serif" }}>{status.replace("_", " ")}</span>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize" style={{ backgroundColor: pc.bg, color: pc.color, fontFamily: "DM Sans, sans-serif" }}>{priority}</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Progress</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1"><FiUsers size={13} style={{ color: muted }} /><span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.members?.length || 0}</span></div>
                  <div className="flex items-center gap-1"><FiCheckCircle size={13} style={{ color }} /><span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>0/{project.tasks?.length || 0}</span></div>
                  <div className="flex items-center gap-1"><FiCalendar size={13} style={{ color: muted }} /><span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}</span></div>
                  <button onClick={e => handleDelete(e, project._id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}><FiTrash2 size={12} /></button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No projects found</p></div>
          )}
        </div>
      )}

      {selectedProject && (
        <ProjectDetail project={selectedProject} allUsers={allUsers} isDark={isDark} onClose={() => setSelectedProject(null)} onRefresh={fetchProjects} />
      )}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default ProjectManagement;