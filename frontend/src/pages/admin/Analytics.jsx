import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import api from "../../services/api";

const TEAM_COLORS = ["#00d4aa", "#a78bfa", "#6c63ff", "#ff6b35", "#f59e0b", "#22c55e"];

// ── Performance score calculator ─────────────────────────────────────────────
const calcPerformanceScore = (userTasks) => {
  if (!userTasks.length) return 0;
  const done        = userTasks.filter(t => t.status === "done").length;
  const onTime      = userTasks.filter(t => t.status === "done" && t.dueDate && new Date(t.dueDate) >= new Date(t.updatedAt)).length;
  const overdue     = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const completion  = (done / userTasks.length) * 50;
  const onTimeBonus = done > 0 ? (onTime / done) * 30 : 0;
  const penalty     = Math.min(overdue * 5, 20);
  return Math.round(Math.min(completion + onTimeBonus + (20 - penalty), 100));
};

const getScoreColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#00d4aa";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
};

const Analytics = () => {
  const { isDark } = useTheme();
  const [loading, setLoading]               = useState(true);
  const [summaryStats, setSummaryStats]     = useState([]);
  const [monthlyData, setMonthlyData]       = useState([]);
  const [employeePerf, setEmployeePerf]     = useState([]);
  const [pieData, setPieData]               = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [topPerformer, setTopPerformer]     = useState(null);
  const [activeTab, setActiveTab]           = useState("overview"); // overview | performance

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const gridBg  = isDark ? "#1e1e30" : "#f1f5f9";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes, projectsRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/users"),
          api.get("/projects"),
        ]);
        const tasks    = tasksRes.tasks    || tasksRes    || [];
        const users    = usersRes.users    || usersRes    || [];
        const projects = projectsRes.projects || projectsRes || [];

        // ── Summary Stats ────────────────────────────────────────────────────
        const done       = tasks.filter(t => t.status === "done").length;
        const inProgress = tasks.filter(t => t.status === "in_progress").length;
        const rate       = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
        setSummaryStats([
          { label: "Total Tasks",  value: String(tasks.length),  color: "#ff6b35" },
          { label: "Completed",    value: String(done),           color: "#22c55e" },
          { label: "Active Users", value: String(users.length),   color: "#6c63ff" },
          { label: "Avg. Score",   value: `${rate}%`,             color: "#00d4aa" },
        ]);

        // ── Pie ──────────────────────────────────────────────────────────────
        const pending = tasks.filter(t => t.status === "todo").length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
        setPieData([
          { name: "Done",        value: done,        color: "#22c55e" },
          { name: "In Progress", value: inProgress,  color: "#6c63ff" },
          { name: "Pending",     value: pending,     color: "#f59e0b" },
          { name: "Overdue",     value: overdue,     color: "#ef4444" },
        ]);

        // ── Monthly Tasks ────────────────────────────────────────────────────
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const now    = new Date();
        const last7  = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
          return { month: months[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear() };
        });
        setMonthlyData(last7.map(({ month, monthIndex, year }) => ({
          month,
          tasks:    tasks.filter(t => { const d = new Date(t.createdAt); return d.getMonth() === monthIndex && d.getFullYear() === year; }).length,
          users:    users.filter(u => { const d = new Date(u.createdAt); return d.getMonth() === monthIndex && d.getFullYear() === year; }).length,
          projects: projects.filter(p => { const d = new Date(p.createdAt); return d.getMonth() === monthIndex && d.getFullYear() === year; }).length,
        })));

        // ── User growth ──────────────────────────────────────────────────────
        setUserGrowthData(["W1","W2","W3","W4","W5","W6"].map((week, i) => ({
          week,
          active: Math.max(1, Math.floor((users.length / 6) * (i + 1))),
          new: users.filter(u => {
            const d = new Date(u.createdAt);
            const ws = new Date(now.getFullYear(), now.getMonth(), 1 + i * 7);
            const we = new Date(now.getFullYear(), now.getMonth(), 8 + i * 7);
            return d >= ws && d < we;
          }).length,
        })));

        // ── Employee Performance ─────────────────────────────────────────────
        const employees = users.filter(u => u.role === "employee");
        const perfData  = employees.map((u, i) => {
          const userTasks = tasks.filter(t => {
            const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
            return assignees.some(a => (a._id || a) === u._id);
          });
          const doneTasks    = userTasks.filter(t => t.status === "done").length;
          const overdueTasks = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
          const inProg       = userTasks.filter(t => t.status === "in_progress").length;
          const reviewTasks  = userTasks.filter(t => t.status === "review").length;
          const score        = calcPerformanceScore(userTasks);
          const completion   = userTasks.length > 0 ? Math.round((doneTasks / userTasks.length) * 100) : 0;

          // Subtask completion
          let totalSubs = 0, doneSubs = 0;
          userTasks.forEach(t => {
            (t.subtasks || []).forEach(s => {
              totalSubs++;
              if (s.isCompleted) doneSubs++;
            });
          });

          return {
            _id:         u._id,
            name:        u.name,
            email:       u.email,
            avatar:      u.avatar,
            color:       TEAM_COLORS[i % TEAM_COLORS.length],
            score,
            scoreLabel:  getScoreLabel(score),
            scoreColor:  getScoreColor(score),
            total:       userTasks.length,
            done:        doneTasks,
            overdue:     overdueTasks,
            inProgress:  inProg,
            review:      reviewTasks,
            completion,
            subtasks:    { total: totalSubs, done: doneSubs },
            // Radar data
            radar: [
              { subject: "Completion", value: completion },
              { subject: "On Time",    value: overdueTasks === 0 ? 100 : Math.max(0, 100 - overdueTasks * 20) },
              { subject: "Volume",     value: Math.min(userTasks.length * 10, 100) },
              { subject: "Subtasks",   value: totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0 },
              { subject: "Review",     value: reviewTasks > 0 ? 80 : 100 },
            ],
          };
        });

        perfData.sort((a, b) => b.score - a.score);
        setEmployeePerf(perfData);
        if (perfData.length > 0) setTopPerformer(perfData[0]);

      } catch (err) {
        console.error("Analytics fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl p-3" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <p className="text-xs font-bold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{label}</p>
          {payload.map((p, i) => <p key={i} className="text-xs" style={{ color: p.color, fontFamily: "DM Sans" }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <PageWrapper title="Analytics">
      <div className="text-center py-12">
        <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading analytics...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Analytics">

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-5">
        {["overview", "performance"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
            style={{
              backgroundColor: activeTab === tab ? (tab === "performance" ? "#6c63ff" : "#ff6b35") : (isDark ? "#12121f" : "#ffffff"),
              color:           activeTab === tab ? "white" : muted,
              border:          `1px solid ${activeTab === tab ? "transparent" : border}`,
              fontFamily:      "DM Sans, sans-serif",
            }}>
            {tab === "overview" ? "📊 Overview" : "🏆 Performance"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {summaryStats.map((stat, i) => (
              <div key={stat.label} className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                <p className="text-2xl font-black" style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Monthly Tasks</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
                  <XAxis dataKey="month" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasks" stroke="#ff6b35" strokeWidth={2} fill="url(#taskGrad)" name="Tasks" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>User Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
                  <XAxis dataKey="week" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="active" stroke="#6c63ff" strokeWidth={2} fill="url(#userGrad)" name="Active" />
                  <Area type="monotone" dataKey="new" stroke="#00d4aa" strokeWidth={2} fill="none" name="New" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Team Performance</h3>
              {employeePerf.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No team data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={employeePerf.slice(0, 5)} layout="vertical" barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridBg} horizontal={false} />
                    <XAxis type="number" tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Performance Score">
                      {employeePerf.slice(0, 5).map((e, i) => <Cell key={i} fill={e.scoreColor} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Task Breakdown</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map(item => (
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
        </>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab === "performance" && (
        <>
          {/* Top Performer Highlight */}
          {topPerformer && (
            <div className="rounded-2xl p-5 mb-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${topPerformer.scoreColor}22, ${topPerformer.scoreColor}08)`, border: `1px solid ${topPerformer.scoreColor}40` }}>
              <div className="flex items-center gap-4">
                <div style={{ position: "relative" }}>
                  <img src={topPerformer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topPerformer.name}`}
                    className="w-14 h-14 rounded-xl"
                    style={{ border: `3px solid ${topPerformer.scoreColor}` }} />
                  <span style={{ position: "absolute", top: -8, right: -8, fontSize: 20 }}>🏆</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-xs font-bold mb-0.5" style={{ color: topPerformer.scoreColor, fontFamily: "DM Sans, sans-serif" }}>TOP PERFORMER</p>
                  <h3 className="text-lg font-black" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{topPerformer.name}</h3>
                  <p className="text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                    {topPerformer.done} tasks completed • {topPerformer.completion}% completion rate
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: topPerformer.scoreColor, fontFamily: "Syne, sans-serif" }}>{topPerformer.score}</p>
                  <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Performance Score</p>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                    style={{ backgroundColor: `${topPerformer.scoreColor}20`, color: topPerformer.scoreColor, fontFamily: "DM Sans, sans-serif" }}>
                    {topPerformer.scoreLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Employee Performance Cards */}
          {employeePerf.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No employees found</p>
              <p className="text-sm mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Create employee accounts to see performance data</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {employeePerf.map((emp, i) => (
                <div key={emp._id} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>

                  {/* Card Header */}
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <img src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                        style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${emp.scoreColor}` }} />
                      {i === 0 && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 16 }}>🏆</span>}
                      {i === 1 && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 16 }}>🥈</span>}
                      {i === 2 && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 16 }}>🥉</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: text, fontFamily: "Syne, sans-serif" }}>
                        {emp.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>{emp.email}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: emp.scoreColor, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                        {emp.score}
                      </p>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, backgroundColor: `${emp.scoreColor}20`, color: emp.scoreColor, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                        {emp.scoreLabel}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Total",    value: emp.total,      color: text },
                        { label: "Done",     value: emp.done,       color: "#22c55e" },
                        { label: "Overdue",  value: emp.overdue,    color: emp.overdue > 0 ? "#ef4444" : muted },
                        { label: "Review",   value: emp.review,     color: "#f59e0b" },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.value}</p>
                          <p style={{ margin: 0, fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Completion Bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>Task Completion</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: emp.scoreColor, fontFamily: "DM Sans, sans-serif" }}>{emp.completion}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${emp.completion}%`, background: `linear-gradient(90deg, ${emp.scoreColor}, ${emp.scoreColor}aa)`, borderRadius: 4, transition: "width 1s" }} />
                      </div>
                    </div>

                    {/* Subtask Stats */}
                    {emp.subtasks.total > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>Subtask Completion</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>
                            {emp.subtasks.done}/{emp.subtasks.total}
                          </span>
                        </div>
                        <div style={{ height: 4, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.round((emp.subtasks.done / emp.subtasks.total) * 100)}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 4 }} />
                        </div>
                      </div>
                    )}

                    {/* Radar Chart */}
                    <div style={{ marginTop: 8 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>Performance Breakdown</p>
                      <ResponsiveContainer width="100%" height={140}>
                        <RadarChart data={emp.radar}>
                          <PolarGrid stroke={border} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: muted, fontSize: 10, fontFamily: "DM Sans" }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name={emp.name} dataKey="value" stroke={emp.scoreColor} fill={emp.scoreColor} fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Analytics;