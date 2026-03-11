import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../services/api";

const MEMBER_COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];

const Reports = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridBg = isDark ? "#1e1e30" : "#f1f5f9";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/users"),
        ]);
        const allProjects = projectsRes.projects || projectsRes || [];
        const allTasks = tasksRes.tasks || tasksRes || [];
        const allUsers = usersRes.users || usersRes || [];

        // Manager's projects & tasks
        const managed = allProjects.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        const projectIds = new Set(managed.map(p => p._id));
        const myTasks = allTasks.filter(t => projectIds.has(t.project?._id || t.project));

        // Pie data
        const completed = myTasks.filter(t => t.status === "completed").length;
        const inProgress = myTasks.filter(t => t.status === "in-progress").length;
        const todo = myTasks.filter(t => t.status === "todo").length;
        setPieData([
          { name: "Done", value: completed, color: "#22c55e" },
          { name: "In Progress", value: inProgress, color: "#6c63ff" },
          { name: "Todo", value: todo, color: "#f59e0b" },
        ]);

        // Weekly data — last 4 weeks
        const now = new Date();
        const weekly = ["W1", "W2", "W3", "W4"].map((week, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (3 - i) * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          const weekTasks = myTasks.filter(t => {
            const d = new Date(t.updatedAt || t.createdAt);
            return d >= weekStart && d < weekEnd;
          });
          return {
            week,
            completed: weekTasks.filter(t => t.status === "completed").length,
            added: weekTasks.length,
          };
        });
        setWeeklyData(weekly);

        // Member performance
        const memberIds = new Set();
        managed.forEach(p => (p.members || []).forEach(m => memberIds.add(m._id || m)));
        const teamUsers = allUsers.filter(u => memberIds.has(u._id)).slice(0, 5);
        const performance = teamUsers.map((u, i) => {
          const userTasks = myTasks.filter(t => {
            const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
            return assignees.some(a => (a._id || a) === u._id);
          });
          return {
            name: u.name.split(" ")[0],
            fullName: u.name,
            avatar: u.avatar,
            tasks: userTasks.length,
            done: userTasks.filter(t => t.status === "completed").length,
            color: MEMBER_COLORS[i % MEMBER_COLORS.length],
          };
        });
        setMemberData(performance);
      } catch (err) {
        console.error("Reports error", err);
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
          <p className="text-xs font-bold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{label}</p>
          {payload.map((p, i) => <p key={i} className="text-xs" style={{ color: p.color, fontFamily: "DM Sans" }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  if (loading) return <PageWrapper title="Reports"><div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading reports...</p></div></PageWrapper>;

  return (
    <PageWrapper title="Reports">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis dataKey="week" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#00d4aa" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="added" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Added" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Task Status</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
        <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Team Performance</h3>
        {memberData.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No team data yet</p>
        ) : (
          <div className="space-y-4">
            {memberData.map((member, i) => {
              const pct = member.tasks > 0 ? Math.round((member.done / member.tasks) * 100) : 0;
              return (
                <div key={member.name} style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`}
                        className="w-7 h-7 rounded-full" style={{ border: `2px solid ${member.color}` }} />
                      <span className="text-sm font-medium" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{member.fullName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{member.done}/{member.tasks} tasks</span>
                      <span className="text-xs font-bold" style={{ color: member.color, fontFamily: "DM Sans, sans-serif" }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${member.color}20` }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: member.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Reports;