import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import api from "../../services/api";

const MEMBER_COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];

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
  return "Needs Work";
};

const calcScore = (tasks) => {
  if (!tasks.length) return 0;
  const done     = tasks.filter(t => t.status === "done").length;
  const overdue  = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const completion = (done / tasks.length) * 70;
  const penalty    = Math.min(overdue * 10, 30);
  return Math.round(Math.min(completion + (30 - penalty), 100));
};

const Reports = () => {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const [weeklyData, setWeeklyData]   = useState([]);
  const [pieData, setPieData]         = useState([]);
  const [memberData, setMemberData]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [selectedMember, setSelectedMember] = useState(null);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const gridBg  = isDark ? "#1e1e30" : "#f1f5f9";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/users"),
        ]);
        const allProjects = projectsRes.projects || projectsRes || [];
        const allTasks    = tasksRes.tasks    || tasksRes    || [];
        const allUsers    = usersRes.users    || usersRes    || [];

        const managed    = allProjects.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        const projectIds = new Set(managed.map(p => p._id));
        const myTasks    = allTasks.filter(t => projectIds.has(t.project?._id || t.project));

        // ── Pie data ─────────────────────────────────────────────────────────
        const done       = myTasks.filter(t => t.status === "done").length;
        const inProgress = myTasks.filter(t => t.status === "in_progress").length;
        const todo       = myTasks.filter(t => t.status === "todo").length;
        const review     = myTasks.filter(t => t.status === "review").length;
        setPieData([
          { name: "Done",        value: done,        color: "#22c55e" },
          { name: "In Progress", value: inProgress,  color: "#6c63ff" },
          { name: "Review",      value: review,      color: "#f59e0b" },
          { name: "Todo",        value: todo,        color: "#6b6b8a" },
        ]);

        // ── Weekly data ───────────────────────────────────────────────────────
        const now    = new Date();
        const weekly = ["W1","W2","W3","W4"].map((week, i) => {
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
            done:  weekTasks.filter(t => t.status === "done").length,
            added: weekTasks.length,
          };
        });
        setWeeklyData(weekly);

        // ── Member performance ────────────────────────────────────────────────
        const memberIds = new Set();
        managed.forEach(p => (p.members || []).forEach(m => memberIds.add(m._id || m)));
        const teamUsers = allUsers.filter(u => memberIds.has(u._id)).slice(0, 6);

        const performance = teamUsers.map((u, i) => {
          const userTasks = myTasks.filter(t => {
            const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
            return assignees.some(a => (a._id || a) === u._id);
          });
          const doneTasks   = userTasks.filter(t => t.status === "done").length;
          const overdue     = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
          const inProg      = userTasks.filter(t => t.status === "in_progress").length;
          const reviewCount = userTasks.filter(t => t.status === "review").length;
          const score       = calcScore(userTasks);
          const completion  = userTasks.length > 0 ? Math.round((doneTasks / userTasks.length) * 100) : 0;

          // Subtasks
          let totalSubs = 0, doneSubs = 0;
          userTasks.forEach(t => {
            (t.subtasks || []).forEach(s => { totalSubs++; if (s.isCompleted) doneSubs++; });
          });

          return {
            _id:        u._id,
            name:       u.name,
            shortName:  u.name.split(" ")[0],
            email:      u.email,
            avatar:     u.avatar,
            color:      MEMBER_COLORS[i % MEMBER_COLORS.length],
            score,
            scoreColor: getScoreColor(score),
            scoreLabel: getScoreLabel(score),
            total:      userTasks.length,
            done:       doneTasks,
            overdue,
            inProgress: inProg,
            review:     reviewCount,
            completion,
            subtasks:   { total: totalSubs, done: doneSubs },
            radar: [
              { subject: "Completion", value: completion },
              { subject: "On Time",    value: overdue === 0 ? 100 : Math.max(0, 100 - overdue * 20) },
              { subject: "Volume",     value: Math.min(userTasks.length * 10, 100) },
              { subject: "Subtasks",   value: totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0 },
              { subject: "Review",     value: reviewCount > 0 ? 70 : 100 },
            ],
          };
        });

        performance.sort((a, b) => b.score - a.score);
        setMemberData(performance);
        if (performance.length > 0) setSelectedMember(performance[0]);

      } catch (err) {
        console.error("Reports error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
  }, [user]);

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
    <PageWrapper title="Reports">
      <div className="text-center py-12">
        <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading reports...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Reports">

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-5">
        {["overview", "performance"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
            style={{
              backgroundColor: activeTab === tab ? "#00d4aa" : (isDark ? "#12121f" : "#ffffff"),
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Weekly Progress</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barSize={14} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
                  <XAxis dataKey="week" tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="done"  fill="#00d4aa" radius={[4,4,0,0]} name="Done" />
                  <Bar dataKey="added" fill="#f59e0b" radius={[4,4,0,0]} name="Added" />
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
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team completion bars */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>Team Performance</h3>
            {memberData.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>No team data yet</p>
            ) : (
              <div className="space-y-4">
                {memberData.map((member, i) => (
                  <div key={member._id} style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                          className="w-7 h-7 rounded-full" style={{ border: `2px solid ${member.scoreColor}` }} />
                        <span className="text-sm font-medium" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{member.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                          style={{ backgroundColor: `${member.scoreColor}20`, color: member.scoreColor, fontFamily: "DM Sans, sans-serif" }}>
                          {member.scoreLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{member.done}/{member.total} tasks</span>
                        <span className="text-xs font-bold" style={{ color: member.scoreColor, fontFamily: "DM Sans, sans-serif" }}>{member.score} pts</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${member.scoreColor}20` }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${member.completion}%`, background: `linear-gradient(90deg, ${member.scoreColor}, ${member.scoreColor}aa)` }} />
                    </div>
                    {member.overdue > 0 && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>
                        ⚠ {member.overdue} overdue task{member.overdue > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab === "performance" && (
        <>
          {memberData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No team members yet</p>
              <p className="text-sm mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Add employees to your projects to see performance</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Member list */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
                  <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 14, fontWeight: 700 }}>Rankings</h3>
                </div>
                <div>
                  {memberData.map((m, i) => (
                    <div key={m._id}
                      onClick={() => setSelectedMember(m)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${border}`, backgroundColor: selectedMember?._id === m._id ? `${m.scoreColor}10` : "transparent", transition: "background 0.2s" }}>
                      <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                        style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${m.scoreColor}` }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text, fontFamily: "DM Sans, sans-serif" }}>{m.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>{m.done}/{m.total} done</p>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 900, color: m.scoreColor, fontFamily: "Syne, sans-serif" }}>{m.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected member detail */}
              {selectedMember && (
                <div className="lg:col-span-2 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={selectedMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`}
                      style={{ width: 48, height: 48, borderRadius: 12, border: `3px solid ${selectedMember.scoreColor}` }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 16, fontWeight: 700 }}>{selectedMember.name}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>{selectedMember.email}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: selectedMember.scoreColor, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                        {selectedMember.score}
                      </p>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, backgroundColor: `${selectedMember.scoreColor}20`, color: selectedMember.scoreColor, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                        {selectedMember.scoreLabel}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: 20 }}>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Total",   value: selectedMember.total,      color: text },
                        { label: "Done",    value: selectedMember.done,       color: "#22c55e" },
                        { label: "Overdue", value: selectedMember.overdue,    color: selectedMember.overdue > 0 ? "#ef4444" : muted },
                        { label: "Review",  value: selectedMember.review,     color: "#f59e0b" },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.value}</p>
                          <p style={{ margin: 0, fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Completion bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>Completion Rate</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: selectedMember.scoreColor }}>{selectedMember.completion}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${selectedMember.completion}%`, background: `linear-gradient(90deg, ${selectedMember.scoreColor}, ${selectedMember.scoreColor}aa)`, borderRadius: 4, transition: "width 1s" }} />
                      </div>
                    </div>

                    {/* Subtask bar */}
                    {selectedMember.subtasks.total > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>Subtask Completion</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#6c63ff" }}>{selectedMember.subtasks.done}/{selectedMember.subtasks.total}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.round((selectedMember.subtasks.done / selectedMember.subtasks.total) * 100)}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 4 }} />
                        </div>
                      </div>
                    )}

                    {/* Radar */}
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={selectedMember.radar}>
                        <PolarGrid stroke={border} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans" }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name={selectedMember.name} dataKey="value" stroke={selectedMember.scoreColor} fill={selectedMember.scoreColor} fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Reports;