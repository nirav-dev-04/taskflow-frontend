import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiClock, FiSearch } from "react-icons/fi";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "High" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Medium" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Low" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Critical" },
};

const STATUS_CONFIG = {
  "in-progress": { color: "#6c63ff", bg: "rgba(108,99,255,0.1)", label: "In Progress" },
  todo: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Todo" },
  review: { color: "#00d4aa", bg: "rgba(0,212,170,0.1)", label: "Review" },
  completed: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Done" },
};

const MyTasks = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      const allTasks = res.tasks || res || [];
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(t => {
        const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
        return assignees.some(a => (a._id || a) === user?._id);
      });
      setTasks(myTasks);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchTasks();
  }, [user]);

  const toggleDone = async (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch {
      toast.error("Failed to update task");
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.project?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus.toLowerCase().replace(" ", "-");
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
            {["All", "Todo", "In Progress", "Review", "Completed"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
            {["All", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <p className="text-sm mb-4" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          Showing <span style={{ color: "#a78bfa", fontWeight: 600 }}>{filtered.length}</span> tasks
        </p>

        {loading ? (
          <div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading tasks...</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task, i) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
              const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
              const isDone = task.status === "completed";
              return (
                <div key={task._id} className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${isDone ? "transparent" : border}`, animation: `slideUp 0.3s ease ${i * 0.05}s both`, opacity: isDone ? 0.7 : 1 }}>
                  <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                    {isDone ? <MdCheckCircle size={20} style={{ color: "#22c55e" }} /> : <MdRadioButtonUnchecked size={20} style={{ color: muted }} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif", textDecoration: isDone ? "line-through" : "none" }}>{task.title}</p>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: priority.bg, color: priority.color, fontFamily: "DM Sans, sans-serif" }}>{priority.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: status.bg, color: status.color, fontFamily: "DM Sans, sans-serif" }}>{status.label}</span>
                      </div>
                    </div>
                    {task.description && <p className="text-xs mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {task.project?.name && (
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: "rgba(167,139,250,0.1)", color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}>{task.project.name}</span>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <FiClock size={11} style={{ color: isToday ? "#ef4444" : muted }} />
                          <span className="text-xs" style={{ color: isToday ? "#ef4444" : muted, fontFamily: "DM Sans, sans-serif" }}>
                            {isToday ? "Today" : new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      )}
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
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default MyTasks;