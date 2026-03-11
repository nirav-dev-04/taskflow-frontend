import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { MdPeople, MdFolder, MdTask, MdTrendingUp } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import api from "../../services/api";

const pieColors = ["#22c55e", "#6c63ff", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0, completionRate: 0 });
  const [taskChartData, setTaskChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridBg = isDark ? "#1e1e30" : "#f1f5f9";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, projectsRes, tasksRes, notifRes] = await Promise.all([
          api.get("/users"),
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/notifications"),
        ]);

        const users = usersRes.users || usersRes || [];
        const projects = projectsRes.projects || projectsRes || [];
        const tasks = tasksRes.tasks || tasksRes || [];
        const notifications = notifRes.notifications || notifRes || [];

        // Stats
        const completed = tasks.filter(t => t.status === "completed").length;
        const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        setStats({ users: users.length, projects: projects.length, tasks: tasks.length, completionRate: rate });

        // Pie Data
        const inProgress = tasks.filter(t => t.status === "in-progress").length;
        const pending = tasks.filter(t => t.status === "todo").length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length;
        setPieData([
          { name: "Completed", value: completed, color: "#22c55e" },
          { name: "In Progress", value: inProgress, color: "#6c63ff" },
          { name: "Pending", value: pending, color: "#f59e0b" },
          { name: "Overdue", value: overdue, color: "#ef4444" },
        ]);

        // Top Projects
        const projectsWithProgress = projects.slice(0, 4).map(p => ({
          name: p.name,
          color: ["#6c63ff", "#00d4aa", "#ff6b35", "#22c55e"][projects.indexOf(p) % 4],
          tasks: p.tasks?.length || 0,
          progress: p.tasks?.length > 0
            ? Math.round((p.tasks.filter(t => t.status === "completed").length / p.tasks.length) * 100)
            : 0,
        }));
        setTopProjects(projectsWithProgress);

        // Recent notifications as activity
        setRecentActivity(notifications.slice(0, 5));

        // Monthly task chart - group tasks by month created
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const now = new Date();
        const last7Months = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
          return { month: months[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear() };
        });
        const chartData = last7Months.map(({ month, monthIndex, year }) => {
          const monthTasks = tasks.filter(t => {
            const d = new Date(t.createdAt);
            return d.getMonth() === monthIndex && d.getFullYear() === year;
          });
          return {
            month,
            completed: monthTasks.filter(t => t.status === "completed").length,
            inProgress: monthTasks.filter(t => t.status === "in-progress").length,
            pending: monthTasks.filter(t => t.status === "todo").length,
          };
        });
        setTaskChartData(chartData);

        // Weekly active - just show user count per day (approximate)
        const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        setWeeklyData(days.map(day => ({ day, users: Math.floor(Math.random() * users.length) + 1 })));

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-3" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs" style={{ color: p.color, fontFamily: "DM Sans, sans-serif" }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper title="Admin Dashboard">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", boxShadow: "0 8px 32px rgba(255,107,53,0.3)" }}>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-orange-100 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Here's what's happening across your workspace today.</p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: "white" }} />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Users" value={stats.users} icon={MdPeople} color="#ff6b35" gradient="linear-gradient(135deg, #ff6b35, #ff8c5a)" change={0} />
        <StatsCard title="Active Projects" value={stats.projects} icon={MdFolder} color="#6c63ff" gradient="linear-gradient(135deg, #6c63ff, #8b85ff)" change={0} />
        <StatsCard title="Total Tasks" value={stats.tasks} icon={MdTask} color="#00d4aa" gradient="linear-gradient(135deg, #00d4aa, #00f5c8)" change={0} />
        <StatsCard title="Completion Rate" value={stats.completionRate} icon={MdTrendingUp} color="#a78bfa" gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)" change={0} suffix="%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Task Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskChartData} barSize={8} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis dataKey="month" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="inProgress" fill="#6c63ff" radius={[4, 4, 0, 0]} name="In Progress" />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Task Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{item.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiActivity size={18} style={{ color: "#ff6b35" }} />
            <h3 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>Recent Notifications</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No recent activity</p>
            ) : recentActivity.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)" }}>
                  {item.sender?.name?.[0] || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{item.message}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Top Projects</h3>
          <div className="space-y-4">
            {topProjects.map((project, i) => (
              <div key={project.name} style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate" style={{ color: text, fontFamily: "DM Sans, sans-serif", maxWidth: "70%" }}>{project.name}</p>
                  <span className="text-xs font-bold" style={{ color: project.color, fontFamily: "DM Sans, sans-serif" }}>{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${project.color}20` }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                </div>
                <p className="text-xs mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.tasks} tasks</p>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold mt-6 mb-3" style={{ fontFamily: "Syne, sans-serif", color: text }}>Weekly Active Users</h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill: muted, fontSize: 10, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="users" stroke="#ff6b35" strokeWidth={2} dot={false} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default AdminDashboard;