import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MdFolder, MdTask, MdPeople, MdTrendingUp } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import api from "../../services/api";

const COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];

const ManagerDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState({ projects: 0, members: 0, tasks: 0, completion: 0 });
  const [myProjects, setMyProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [sprintData, setSprintData] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridBg = isDark ? "#1e1e30" : "#f1f5f9";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/users"),
        ]);

        const allProjects = projectsRes.projects || projectsRes || [];
        const allTasks = tasksRes.tasks || tasksRes || [];
        const allUsers = usersRes.users || usersRes || [];

        // Manager's projects
        const managed = allProjects.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        setMyProjects(managed.slice(0, 3));

        // Team members (employees in manager's projects)
        const memberIds = new Set();
        managed.forEach(p => (p.members || []).forEach(m => memberIds.add(m._id || m)));
        const team = allUsers.filter(u => memberIds.has(u._id) && u.role === "employee");
        setTeamMembers(team.slice(0, 4));

        // Tasks in managed projects
        const projectIds = new Set(managed.map(p => p._id));
        const myTasks = allTasks.filter(t => projectIds.has(t.project?._id || t.project));
        const completed = myTasks.filter(t => t.status === "completed").length;
        const completionRate = myTasks.length > 0 ? Math.round((completed / myTasks.length) * 100) : 0;

        setStats({ projects: managed.length, members: team.length, tasks: myTasks.length, completion: completionRate });

        // Pending reviews
        const reviews = myTasks.filter(t => t.status === "review").slice(0, 3);
        setPendingReviews(reviews);

        // Sprint data — last 5 weeks
        const weeks = ["W1", "W2", "W3", "W4", "W5"];
        const now = new Date();
        const sprint = weeks.map((week, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (4 - i) * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          const weekTasks = myTasks.filter(t => {
            const d = new Date(t.createdAt);
            return d >= weekStart && d < weekEnd;
          });
          return {
            sprint: week,
            done: weekTasks.filter(t => t.status === "completed").length,
            todo: weekTasks.filter(t => t.status === "todo").length,
          };
        });
        setSprintData(sprint);

      } catch (err) {
        console.error("Manager dashboard error", err);
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
          <p className="text-sm font-semibold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{label}</p>
          {payload.map((p, i) => <p key={i} className="text-xs" style={{ color: p.color, fontFamily: "DM Sans, sans-serif" }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper title="Manager Dashboard">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #00d4aa, #00f5c8)", boxShadow: "0 8px 32px rgba(0,212,170,0.3)" }}>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
            Hey {user?.name?.split(" ")[0]}! 🚀
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "DM Sans, sans-serif" }}>
            {stats.completion > 0 ? `Your team has completed ${stats.completion}% of tasks. Keep pushing!` : "Welcome to your manager dashboard!"}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: "white" }} />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="My Projects" value={stats.projects} icon={MdFolder} color="#00d4aa" gradient="linear-gradient(135deg, #00d4aa, #00f5c8)" change={0} />
        <StatsCard title="Team Members" value={stats.members} icon={MdPeople} color="#6c63ff" gradient="linear-gradient(135deg, #6c63ff, #8b85ff)" change={0} />
        <StatsCard title="Active Tasks" value={stats.tasks} icon={MdTask} color="#ff6b35" gradient="linear-gradient(135deg, #ff6b35, #ff8c5a)" change={0} />
        <StatsCard title="Completion" value={stats.completion} icon={MdTrendingUp} color="#a78bfa" gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)" change={0} suffix="%" />
      </div>

      {/* Charts & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Sprint Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sprintData} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis dataKey="sprint" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="done" fill="#00d4aa" radius={[4, 4, 0, 0]} name="Done" />
              <Bar dataKey="todo" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Todo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Workload */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Team Workload</h3>
          {teamMembers.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No team members yet</p>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member, i) => (
                <div key={member._id} className="flex items-center gap-3" style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                  <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-9 h-9 rounded-full shrink-0" style={{ border: "2px solid #00d4aa" }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{member.name}</p>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#00d4aa20" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.floor(Math.random() * 60) + 30}%`, backgroundColor: "#00d4aa" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects & Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>My Projects</h3>
          {myProjects.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No projects assigned yet</p>
          ) : (
            <div className="space-y-4">
              {myProjects.map((project, i) => {
                const color = COLORS[i % COLORS.length];
                const total = project.tasks?.length || 0;
                const done = project.tasks?.filter(t => t.status === "completed").length || 0;
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={project._id} className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                    style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{project.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize" style={{ backgroundColor: `${color}20`, color, fontFamily: "DM Sans, sans-serif" }}>{project.priority || "medium"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{progress}%</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Pending Reviews</h3>
          {pendingReviews.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No tasks in review 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((item, i) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                  style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                  <div className="flex items-center gap-3">
                    <FiClock size={16} style={{ color: "#f59e0b" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{item.title}</p>
                      <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                        {item.assignees?.[0]?.name || item.assignee?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", fontFamily: "DM Sans, sans-serif" }}>Approve</button>
                    <button className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default ManagerDashboard;