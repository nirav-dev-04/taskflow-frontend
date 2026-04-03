import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiClock, FiSearch, FiActivity, FiX, FiPlus } from "react-icons/fi";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "High" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Medium" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Low" },
  critical: { color: "#a855f7", bg: "rgba(168,85,247,0.1)",  label: "Critical" },
};

const STATUS_CONFIG = {
  todo:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Todo" },
  in_progress: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)", label: "In Progress" },
  review:      { color: "#00d4aa", bg: "rgba(0,212,170,0.1)",  label: "Review" },
  done:        { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  label: "Done" },
};

const ACTION_CONFIG = {
  created:           { icon: "✨", color: "#6c63ff" },
  status_changed:    { icon: "🔄", color: "#00d4aa" },
  assigned:          { icon: "👤", color: "#f59e0b" },
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
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getTotalLogged = (task) =>
  (task.timeTracking?.logs || []).reduce((sum, l) => sum + (l.hours || 0), 0);

// ── Activity Log Modal ────────────────────────────────────────────────────────
const ActivityModal = ({ task, isDark, onClose }) => {
  const [log, setLog]         = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayBg = isDark ? "#0a0a0f" : "#f1f5f9";
  const border    = isDark ? "#1e1e30" : "#e2e8f0";
  const text      = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted     = isDark ? "#6b6b8a" : "#64748b";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/tasks/${task._id}/activity`);
        setLog(res.activityLog || []);
      } catch {
        setLog((task.activityLog || []).slice().reverse());
      } finally { setLoading(false); }
    };
    fetch();
  }, [task._id]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: overlayBg, borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", border: `1px solid ${border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, fontWeight: 700 }}>Activity Log</h3>
            <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {loading ? (
            <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>Loading activity...</p>
          ) : log.length === 0 ? (
            <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13, padding: "24px 0" }}>No activity yet</p>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {log.map((entry, i) => {
                  const cfg = ACTION_CONFIG[entry.action] || { icon: "📝", color: muted };
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, paddingLeft: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: `${cfg.color}20`, border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, fontSize: 14 }}>
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, flexShrink: 0 }}>
                            {entry.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>{entry.user?.name || "Someone"}</span>
                          <span style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>{timeAgo(entry.createdAt)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif", lineHeight: 1.4 }}>{entry.detail || entry.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Time Tracking Modal ───────────────────────────────────────────────────────
const TimeModal = ({ task, isDark, onClose, onLogged }) => {
  const [hours, setHours]   = useState("");
  const [note, setNote]     = useState("");
  const [saving, setSaving] = useState(true);
  const [logs, setLogs]     = useState([]);

  const overlayBg = isDark ? "#0a0a0f" : "#f1f5f9";
  const cardBg    = isDark ? "#12121f" : "#ffffff";
  const border    = isDark ? "#1e1e30" : "#e2e8f0";
  const text      = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted     = isDark ? "#6b6b8a" : "#64748b";
  const inputBg   = isDark ? "#0d0d18" : "#f8fafc";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/tasks/${task._id}/time`);
        setLogs(res.timeTracking?.logs || []);
      } catch {
        setLogs(task.timeTracking?.logs || []);
      } finally { setSaving(false); }
    };
    fetch();
  }, [task._id]);

  const totalLogged = logs.reduce((s, l) => s + (l.hours || 0), 0);
  const estimated   = task.timeTracking?.estimated || 0;
  const pct         = estimated > 0 ? Math.min(Math.round((totalLogged / estimated) * 100), 100) : 0;
  const barColor    = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#22c55e";

  const handleLog = async () => {
    const h = parseFloat(hours);
    if (!h || h <= 0) { toast.error("Enter valid hours"); return; }
    setSaving(true);
    try {
      const res = await api.post(`/tasks/${task._id}/time`, { hours: h, note });
      setLogs(res.timeTracking?.logs || []);
      setHours(""); setNote("");
      toast.success(`Logged ${h}h!`);
      onLogged(task._id, res.timeTracking);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log time");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: overlayBg, borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", border: `1px solid ${border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, fontWeight: 700 }}>⏱️ Time Tracking</h3>
            <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><FiX size={18} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Progress vs Estimate */}
          <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>Time Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: barColor, fontFamily: "Syne, sans-serif" }}>
                {totalLogged}h {estimated > 0 ? `/ ${estimated}h estimated` : "logged"}
              </span>
            </div>
            {estimated > 0 && (
              <>
                <div style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${pct}%`, backgroundColor: barColor, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
                <p style={{ margin: 0, fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>
                  {pct >= 100 ? "⚠️ Over estimated time!" : `${pct}% of estimated time used`}
                </p>
              </>
            )}
          </div>

          {/* Log Time Form */}
          <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>Log Time</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif", display: "block", marginBottom: 4 }}>Hours *</label>
                <input
                  type="number" min="0.5" step="0.5" value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="e.g. 2.5"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${border}`, backgroundColor: inputBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif", display: "block", marginBottom: 4 }}>Note (optional)</label>
                <input
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="What did you work on?"
                  onKeyDown={e => e.key === "Enter" && handleLog()}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${border}`, backgroundColor: inputBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={handleLog} disabled={saving}
              style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Logging..." : "⏱️ Log Time"}
            </button>
          </div>

          {/* Time Log History */}
          {logs.length > 0 && (
            <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>
                Time Log History
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...logs].reverse().map((log, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,107,53,0.1)", border: "2px solid #ff6b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6b35", fontFamily: "Syne, sans-serif" }}>{log.hours}h</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                        {log.user?.name || "You"}
                      </p>
                      {log.note && <p style={{ margin: 0, fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>{log.note}</p>}
                    </div>
                    <span style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif", flexShrink: 0 }}>
                      {timeAgo(log.loggedAt)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#ff6b35", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Total Time Logged</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#ff6b35", fontFamily: "Syne, sans-serif" }}>{totalLogged}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const MyTasks = () => {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [activityTask, setActivityTask] = useState(null);
  const [timeTask, setTimeTask]         = useState(null);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res      = await api.get("/tasks");
      const allTasks = res.tasks || res || [];
      const myTasks  = allTasks.filter(t => {
        const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
        return assignees.some(a => (a._id || a) === user?._id);
      });
      setTasks(myTasks);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?._id) fetchTasks(); }, [user]);

  const toggleDone = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch { toast.error("Failed to update task"); }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      setTasks(prev => prev.map(t => t._id === taskId
        ? { ...t, subtasks: res.subtasks || t.subtasks, progress: res.progress ?? t.progress, status: res.status || t.status }
        : t
      ));
    } catch { toast.error("Failed to update subtask"); }
  };

  const handleTimeLogged = (taskId, timeTracking) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, timeTracking } : t));
  };

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title?.toLowerCase().includes(search.toLowerCase()) || t.project?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus === "All"   || t.status === filterStatus.toLowerCase().replace(" ", "_");
    const matchPriority = filterPriority === "All" || t.priority === filterPriority.toLowerCase();
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <PageWrapper title="My Tasks">
      <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
            {["All", "Todo", "In Progress", "Review", "Done"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
            {["All", "High", "Medium", "Low", "Critical"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <p className="text-sm mb-4" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          Showing <span style={{ color: "#a78bfa", fontWeight: 600 }}>{filtered.length}</span> tasks
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading tasks...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task, i) => {
              const status    = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo;
              const priority  = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const isToday   = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
              const isDone    = task.status === "done";
              const recentActivity = (task.activityLog || []).slice(-1)[0];
              const totalHours = getTotalLogged(task);
              const estimated  = task.timeTracking?.estimated || 0;

              return (
                <div key={task._id}
                  className="rounded-xl transition-all duration-200 hover:scale-[1.005]"
                  style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${isOverdue ? "#ef444430" : isDone ? "transparent" : border}`, animation: `slideUp 0.3s ease ${i * 0.05}s both`, opacity: isDone ? 0.75 : 1 }}>

                  {/* Main Row */}
                  <div className="flex items-start gap-3 p-4">
                    <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                      {isDone ? <MdCheckCircle size={20} style={{ color: "#22c55e" }} /> : <MdRadioButtonUnchecked size={20} style={{ color: muted }} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <p className="text-sm font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif", textDecoration: isDone ? "line-through" : "none" }}>
                            {task.title}
                          </p>
                          {(task.dependencies || []).some(d => (d._id ? d : null)?.status !== "done") && (
                            <span style={{ fontSize: 10, color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "1px 6px", borderRadius: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 600, border: "1px solid rgba(239,68,68,0.2)" }}>
                              🔒 BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: priority.bg, color: priority.color, fontFamily: "DM Sans, sans-serif" }}>{priority.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: status.bg, color: status.color, fontFamily: "DM Sans, sans-serif" }}>{status.label}</span>

                          {/* Time Tracking button */}
                          <button onClick={() => setTimeTask(task)} title="Log time"
                            style={{ background: "rgba(255,107,53,0.1)", border: "none", cursor: "pointer", color: "#ff6b35", padding: "3px 7px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                            <FiClock size={11} />
                            <span style={{ fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                              {totalHours > 0 ? `${totalHours}h` : "+"}
                            </span>
                          </button>

                          {/* Activity button */}
                          <button onClick={() => setActivityTask(task)} title="View activity log"
                            style={{ background: "rgba(108,99,255,0.1)", border: "none", cursor: "pointer", color: "#6c63ff", padding: "3px 7px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                            <FiActivity size={11} />
                            <span style={{ fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                              {(task.activityLog || []).length}
                            </span>
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.description}</p>
                      )}

                      {/* Time progress bar — show if time logged */}
                      {totalHours > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif" }}>Time logged</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#ff6b35", fontFamily: "DM Sans, sans-serif" }}>
                              {totalHours}h{estimated > 0 ? ` / ${estimated}h` : ""}
                            </span>
                          </div>
                          {estimated > 0 && (
                            <div style={{ height: 3, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${Math.min((totalHours / estimated) * 100, 100)}%`,
                                backgroundColor: totalHours > estimated ? "#ef4444" : "#ff6b35",
                                borderRadius: 4, transition: "width 0.3s"
                              }} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subtasks */}
                      {(task.subtasks || []).length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold" style={{ color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>
                              Subtasks {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                            </span>
                            <div style={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.round((task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100)}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 4, transition: "width 0.3s" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            {task.subtasks.map((sub, si) => (
                              <div key={sub._id || si} className="flex items-center gap-2">
                                <button onClick={() => toggleSubtask(task._id, sub._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
                                  {sub.isCompleted ? <MdCheckCircle size={15} style={{ color: "#22c55e" }} /> : <MdRadioButtonUnchecked size={15} style={{ color: muted }} />}
                                </button>
                                <span style={{ fontSize: 12, color: sub.isCompleted ? muted : text, fontFamily: "DM Sans, sans-serif", textDecoration: sub.isCompleted ? "line-through" : "none" }}>{sub.title}</span>
                                {sub.assignee && typeof sub.assignee === "object" && (
                                  <span style={{ fontSize: 10, color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>@{sub.assignee.name}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {task.project?.name && (
                          <span className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: "rgba(167,139,250,0.1)", color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}>{task.project.name}</span>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <FiClock size={11} style={{ color: isOverdue ? "#ef4444" : isToday ? "#f59e0b" : muted }} />
                            <span className="text-xs" style={{ color: isOverdue ? "#ef4444" : isToday ? "#f59e0b" : muted, fontFamily: "DM Sans, sans-serif" }}>
                              {isOverdue ? "Overdue" : isToday ? "Due today" : new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                        {recentActivity && (
                          <span style={{ fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif" }}>
                            {ACTION_CONFIG[recentActivity.action]?.icon} {timeAgo(recentActivity.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No tasks found</p>
                <p className="text-sm mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Try changing your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Modal */}
      {activityTask && <ActivityModal task={activityTask} isDark={isDark} onClose={() => setActivityTask(null)} />}

      {/* Time Tracking Modal */}
      {timeTask && <TimeModal task={timeTask} isDark={isDark} onClose={() => setTimeTask(null)} onLogged={handleTimeLogged} />}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default MyTasks;