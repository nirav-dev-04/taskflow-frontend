import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { MdTask, MdCheckCircle, MdPending, MdTrendingUp } from "react-icons/md";
import { FiClock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const STATUS_CONFIG = {
  "in-progress": { color: "#6c63ff", bg: "rgba(108,99,255,0.1)", label: "In Progress" },
  todo: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Todo" },
  review: { color: "#00d4aa", bg: "rgba(0,212,170,0.1)", label: "Review" },
  completed: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Done" },
};

const PRIORITY_CONFIG = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "High" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Medium" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Low" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Critical" },
};

const EmployeeDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, score: 0 });
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, projectsRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);

        const allTasks = tasksRes.tasks || tasksRes || [];
        const allProjects = projectsRes.projects || projectsRes || [];

        // Filter tasks assigned to current user
        const myTaskList = allTasks.filter(t => {
          const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
          return assignees.some(a => (a._id || a) === user?._id);
        });

        // Filter projects where user is a member
        const myProjectList = allProjects.filter(p => {
          const members = p.members || [];
          return members.some(m => (m._id || m) === user?._id) || p.manager?._id === user?._id;
        });

        setMyTasks(myTaskList.slice(0, 5));
        setMyProjects(myProjectList.slice(0, 3));

        // Stats
        const completed = myTaskList.filter(t => t.status === "completed").length;
        const inProgress = myTaskList.filter(t => t.status === "in-progress").length;
        const score = myTaskList.length > 0 ? Math.round((completed / myTaskList.length) * 100) : 0;
        setStats({ total: myTaskList.length, completed, inProgress, score });

        // Weekly activity - tasks created in last 7 days
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const now = new Date();
        const weekly = days.map((day, i) => {
          const dayDate = new Date(now);
          dayDate.setDate(now.getDate() - (6 - i));
          const count = myTaskList.filter(t => {
            const d = new Date(t.createdAt);
            return d.toDateString() === dayDate.toDateString();
          }).length;
          return { day, tasks: count };
        });
        setWeeklyData(weekly);

      } catch (err) {
        console.error("Employee dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
  }, [user]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-3" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <p className="text-xs font-semibold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>
            {label}: {payload[0].value} tasks
          </p>
        </div>
      );
    }
    return null;
  };

  const todayDue = myTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  }).length;

  return (
    <PageWrapper title="My Dashboard">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #a78bfa, #c4b5fd)", boxShadow: "0 8px 32px rgba(167,139,250,0.3)" }}>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
            Welcome, {user?.name?.split(" ")[0]}! ✨
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "DM Sans, sans-serif" }}>
            {todayDue > 0 ? `You have ${todayDue} task${todayDue > 1 ? "s" : ""} due today. Let's get them done!` : "You're all caught up for today! 🎉"}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: "white" }} />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="My Tasks" value={stats.total} icon={MdTask} color="#a78bfa" gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)" change={0} />
        <StatsCard title="Completed" value={stats.completed} icon={MdCheckCircle} color="#22c55e" gradient="linear-gradient(135deg, #22c55e, #4ade80)" change={0} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={MdPending} color="#6c63ff" gradient="linear-gradient(135deg, #6c63ff, #8b85ff)" change={0} />
        <StatsCard title="My Score" value={stats.score} icon={MdTrendingUp} color="#00d4aa" gradient="linear-gradient(135deg, #00d4aa, #00f5c8)" change={0} suffix="%" />
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
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No tasks assigned to you yet 🎉</p>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task, i) => {
                const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
                return (
                  <div key={task._id} className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                    style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}`, animation: `slideUp 0.3s ease ${i * 0.08}s both` }}>
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
                        <FiClock size={11} style={{ color: isToday ? "#ef4444" : muted }} />
                        <span className="text-xs" style={{ color: isToday ? "#ef4444" : muted, fontFamily: "DM Sans, sans-serif" }}>
                          Due: {isToday ? "Today" : new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
          {/* Activity Chart */}
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
                  const colors = ["#6c63ff", "#00d4aa", "#a78bfa"];
                  const color = colors[i % colors.length];
                  const total = project.tasks?.length || 0;
                  const done = project.tasks?.filter(t => t.status === "completed").length || 0;
                  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={project._id} style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-sm font-medium" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{project.name}</p>
                          <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{total} tasks</p>
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
                { label: "Completed", count: stats.completed, icon: FiCheckCircle, color: "#22c55e" },
                { label: "In Progress", count: stats.inProgress, icon: FiClock, color: "#6c63ff" },
                { label: "Overdue", count: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length, icon: FiAlertCircle, color: "#ef4444" },
              ].map((item) => (
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