import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { MdTask, MdCheckCircle, MdPending, MdTrendingUp } from "react-icons/md";
import { FiClock, FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiX } from "react-icons/fi";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const STATUS_CONFIG = {
  in_progress: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)", label: "In Progress" },
  todo:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Todo" },
  review:      { color: "#00d4aa", bg: "rgba(0,212,170,0.1)", label: "Review" },
  done:        { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Done" },
};

const PRIORITY_CONFIG = {
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "High" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Medium" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Low" },
  critical: { color: "#a855f7", bg: "rgba(168,85,247,0.1)",  label: "Critical" },
};

// ── Deadline Alert Banner ─────────────────────────────────────────────────────
const DeadlineAlert = ({ tasks, isDark, onDismiss }) => {
  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "done");
  const dueToday = tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    const d = new Date(t.dueDate);
    return d >= today && d < tomorrow;
  });
  const dueSoon = tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    const d = new Date(t.dueDate);
    const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
    return d > tomorrow && d <= in48h;
  });

  if (!overdue.length && !dueToday.length && !dueSoon.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
      {/* Overdue */}
      {overdue.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 14, backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiAlertCircle size={18} style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ef4444", fontFamily: "Syne, sans-serif" }}>
              🚨 {overdue.length} Overdue Task{overdue.length > 1 ? "s" : ""}!
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {overdue.slice(0, 3).map(t => (
                <span key={t._id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", fontFamily: "DM Sans, sans-serif", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {t.title} • {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              ))}
              {overdue.length > 3 && <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>+{overdue.length - 3} more</span>}
            </div>
          </div>
        </div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 14, backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiAlertTriangle size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
              ⏰ {dueToday.length} Task{dueToday.length > 1 ? "s" : ""} Due Today!
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {dueToday.map(t => (
                <span key={t._id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b", fontFamily: "DM Sans, sans-serif", border: "1px solid rgba(245,158,11,0.2)" }}>
                  {t.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Due in 48h */}
      {dueSoon.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 14, backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiClock size={18} style={{ color: "#3b82f6" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3b82f6", fontFamily: "Syne, sans-serif" }}>
              📅 {dueSoon.length} Task{dueSoon.length > 1 ? "s" : ""} Due in 48 Hours
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {dueSoon.map(t => (
                <span key={t._id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(59,130,246,0.08)", color: "#3b82f6", fontFamily: "DM Sans, sans-serif", border: "1px solid rgba(59,130,246,0.15)" }}>
                  {t.title} • {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, flexShrink: 0 }}>
            <FiX size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const { isDark } = useTheme();
  const { user }   = useAuth();

  const [myTasks, setMyTasks]       = useState([]);
  const [allMyTasks, setAllMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats]           = useState({ total: 0, completed: 0, inProgress: 0, score: 0 });
  const [loading, setLoading]       = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text   = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted  = isDark ? "#6b6b8a" : "#64748b";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, projectsRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);

        const allTasks    = tasksRes.tasks    || tasksRes    || [];
        const allProjects = projectsRes.projects || projectsRes || [];

        const myTaskList = allTasks.filter(t => {
          const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
          return assignees.some(a => (a._id || a) === user?._id);
        });

        const myProjectList = allProjects.filter(p => {
          const members = p.members || [];
          return members.some(m => (m._id || m) === user?._id) || p.manager?._id === user?._id;
        });

        setAllMyTasks(myTaskList);
        setMyTasks(myTaskList.slice(0, 5));
        setMyProjects(myProjectList.slice(0, 3));

        const completed  = myTaskList.filter(t => t.status === "done").length;
        const inProgress = myTaskList.filter(t => t.status === "in_progress").length;
        const score      = myTaskList.length > 0 ? Math.round((completed / myTaskList.length) * 100) : 0;
        setStats({ total: myTaskList.length, completed, inProgress, score });

        const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        const now  = new Date();
        setWeeklyData(days.map((day, i) => {
          const d = new Date(now); d.setDate(now.getDate() - (6 - i));
          const count = myTaskList.filter(t => new Date(t.createdAt).toDateString() === d.toDateString()).length;
          return { day, tasks: count };
        }));

      } catch (err) { console.error("Employee dashboard error", err); }
      finally { setLoading(false); }
    };
    if (user?._id) fetchData();
  }, [user]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl p-3" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <p className="text-xs font-semibold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{label}: {payload[0].value} tasks</p>
        </div>
      );
    }
    return null;
  };

  const todayDue = allMyTasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  }).length;

  const overdueCount = allMyTasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  return (
    <PageWrapper title="My Dashboard">
      {/* Deadline Alerts */}
      {!alertDismissed && (
        <DeadlineAlert tasks={allMyTasks} isDark={isDark} onDismiss={() => setAlertDismissed(true)} />
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: overdueCount > 0 ? "linear-gradient(135deg, #ef4444, #f87171)" : "linear-gradient(135deg, #a78bfa, #c4b5fd)", boxShadow: overdueCount > 0 ? "0 8px 32px rgba(239,68,68,0.3)" : "0 8px 32px rgba(167,139,250,0.3)" }}>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
            {overdueCount > 0 ? `⚠️ Hey ${user?.name?.split(" ")[0]}!` : `Welcome, ${user?.name?.split(" ")[0]}! ✨`}
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "DM Sans, sans-serif" }}>
            {overdueCount > 0
              ? `You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Please address them ASAP!`
              : todayDue > 0
                ? `You have ${todayDue} task${todayDue > 1 ? "s" : ""} due today. Let's get them done!`
                : "You're all caught up for today! 🎉"}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: "white" }} />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="My Tasks"    value={stats.total}     icon={MdTask}        color="#a78bfa" gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)" change={0} />
        <StatsCard title="Completed"   value={stats.completed} icon={MdCheckCircle} color="#22c55e" gradient="linear-gradient(135deg, #22c55e, #4ade80)"  change={0} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={MdPending}    color="#6c63ff" gradient="linear-gradient(135deg, #6c63ff, #8b85ff)"  change={0} />
        <StatsCard title="My Score"    value={stats.score}     icon={MdTrendingUp}  color="#00d4aa" gradient="linear-gradient(135deg, #00d4aa, #00f5c8)"  change={0} suffix="%" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks List */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>My Tasks</h3>
            <span className="text-xs px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: "rgba(167,139,250,0.1)", color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}>
              {myTasks.length} tasks
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Loading tasks...</p>
          ) : myTasks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No tasks assigned yet 🎉</p>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task, i) => {
                const status   = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo;
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const now      = new Date();
                const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const isToday  = task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString();
                const isOverdue = task.dueDate && new Date(task.dueDate) < today && task.status !== "done";
                const in48h    = task.dueDate && !isOverdue && !isToday && new Date(task.dueDate) <= new Date(now.getTime() + 48 * 3600 * 1000);

                return (
                  <div key={task._id} className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                    style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.3)" : isToday ? "rgba(245,158,11,0.3)" : border}`, animation: `slideUp 0.3s ease ${i * 0.08}s both` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{task.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.project?.name || "No project"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: priority.bg, color: priority.color, fontFamily: "DM Sans, sans-serif" }}>{priority.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: status.bg, color: status.color, fontFamily: "DM Sans, sans-serif" }}>{status.label}</span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 mt-2">
                        {isOverdue ? <FiAlertCircle size={11} style={{ color: "#ef4444" }} /> :
                         isToday   ? <FiAlertTriangle size={11} style={{ color: "#f59e0b" }} /> :
                                     <FiClock size={11} style={{ color: in48h ? "#3b82f6" : muted }} />}
                        <span className="text-xs font-medium" style={{ color: isOverdue ? "#ef4444" : isToday ? "#f59e0b" : in48h ? "#3b82f6" : muted, fontFamily: "DM Sans, sans-serif" }}>
                          {isOverdue ? "Overdue!" : isToday ? "Due Today!" : in48h ? "Due Soon" : `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Weekly Activity */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: muted, fontSize: 10, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="tasks" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 3 }} name="Tasks" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* My Projects */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>My Projects</h3>
            {myProjects.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No projects yet</p>
            ) : (
              <div className="space-y-4">
                {myProjects.map((project, i) => {
                  const colors    = ["#6c63ff", "#00d4aa", "#a78bfa"];
                  const color     = colors[i % colors.length];
                  const total     = project.tasks?.length || 0;
                  const done      = project.tasks?.filter(t => t.status === "done").length || 0;
                  const progress  = total > 0 ? Math.round((done / total) * 100) : 0;
                  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();
                  return (
                    <div key={project._id} style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <p className="text-sm font-medium" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{project.name}</p>
                            {isOverdue && <span style={{ fontSize: 10, color: "#ef4444" }}>⚠️</span>}
                          </div>
                          <p className="text-xs" style={{ color: isOverdue ? "#ef4444" : muted, fontFamily: "DM Sans, sans-serif" }}>
                            {total} tasks {isOverdue ? "• Overdue!" : ""}
                          </p>
                        </div>
                        <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Task Summary */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: "Syne, sans-serif", color: text }}>Task Summary</h3>
            <div className="space-y-2">
              {[
                { label: "Completed",  count: stats.completed,  icon: FiCheckCircle,   color: "#22c55e" },
                { label: "In Progress", count: stats.inProgress, icon: FiClock,         color: "#6c63ff" },
                { label: "Overdue",    count: overdueCount,     icon: FiAlertCircle,   color: "#ef4444" },
                { label: "Due Today",  count: todayDue,         icon: FiAlertTriangle, color: "#f59e0b" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
                  <div className="flex items-center gap-2">
                    <item.icon size={15} style={{ color: item.color }} />
                    <span className="text-sm" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{item.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color, fontFamily: "Syne, sans-serif" }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default EmployeeDashboard;