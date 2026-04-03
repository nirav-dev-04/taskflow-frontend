import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiCheckCircle, FiClock, FiSearch, FiAlertCircle, FiActivity } from "react-icons/fi";
import api from "../../services/api";

// ── Workload level config ─────────────────────────────────────────────────────
const getWorkload = (total) => {
  if (total === 0)  return { label: "Free",       color: "#6b6b8a", bg: "rgba(107,107,138,0.1)", bar: "#6b6b8a" };
  if (total <= 3)   return { label: "Light",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",   bar: "#22c55e" };
  if (total <= 6)   return { label: "Normal",     color: "#00d4aa", bg: "rgba(0,212,170,0.1)",   bar: "#00d4aa" };
  if (total <= 9)   return { label: "Busy",       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  bar: "#f59e0b" };
  return               { label: "Overloaded",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",   bar: "#ef4444" };
};

const STATUS_COLORS = {
  todo:        { color: "#6b6b8a", label: "To Do" },
  in_progress: { color: "#3b82f6", label: "In Progress" },
  review:      { color: "#f59e0b", label: "Review" },
  done:        { color: "#22c55e", label: "Done" },
};

const MyTeam = () => {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const [team, setTeam]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("name"); // name | workload | completion
  const [expanded, setExpanded] = useState(null);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [projectsRes, usersRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/users"),
          api.get("/tasks"),
        ]);
        const allProjects = projectsRes.projects || projectsRes || [];
        const allUsers    = usersRes.users    || usersRes    || [];
        const allTasks    = tasksRes.tasks    || tasksRes    || [];

        const managed = allProjects.filter(p =>
          p.manager?._id === user?._id || p.manager === user?._id
        );

        const memberIds     = new Set();
        const memberProjects = {};
        managed.forEach(p => {
          (p.members || []).forEach(m => {
            const id = m._id || m;
            memberIds.add(id);
            if (!memberProjects[id]) memberProjects[id] = [];
            memberProjects[id].push({ name: p.name, _id: p._id });
          });
        });

        const teamUsers = allUsers.filter(u => memberIds.has(u._id));

        const teamWithStats = teamUsers.map(u => {
          const userTasks = allTasks.filter(t => {
            const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
            return assignees.some(a => (a._id || a) === u._id);
          });

          // Status breakdown
          const statusBreakdown = { todo: 0, in_progress: 0, review: 0, done: 0 };
          userTasks.forEach(t => { if (statusBreakdown[t.status] !== undefined) statusBreakdown[t.status]++; });

          // Subtask stats
          let totalSubtasks = 0, doneSubtasks = 0;
          userTasks.forEach(t => {
            (t.subtasks || []).forEach(s => {
              totalSubtasks++;
              const assigneeId = s.assignee?._id || s.assignee;
              if (assigneeId === u._id && s.isCompleted) doneSubtasks++;
            });
          });

          // Overdue tasks
          const now = new Date();
          const overdue = userTasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
          ).length;

          const total      = userTasks.length;
          const done       = userTasks.filter(t => t.status === "done").length;
          const completion = total > 0 ? Math.round((done / total) * 100) : 0;

          return {
            ...u,
            taskStats: { total, done, completion, overdue, statusBreakdown },
            subtaskStats: { total: totalSubtasks, done: doneSubtasks },
            projects: memberProjects[u._id] || [],
            tasks: userTasks,
          };
        });

        setTeam(teamWithStats);
      } catch (err) {
        console.error("Failed to load team", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchTeam();
  }, [user]);

  const filtered = team
    .filter(m =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "workload")   return (b.taskStats?.total || 0) - (a.taskStats?.total || 0);
      if (sortBy === "completion") return (b.taskStats?.completion || 0) - (a.taskStats?.completion || 0);
      return a.name?.localeCompare(b.name);
    });

  // Team summary stats
  const totalTasks    = team.reduce((s, m) => s + (m.taskStats?.total || 0), 0);
  const totalDone     = team.reduce((s, m) => s + (m.taskStats?.done  || 0), 0);
  const totalOverdue  = team.reduce((s, m) => s + (m.taskStats?.overdue || 0), 0);
  const overloaded    = team.filter(m => (m.taskStats?.total || 0) > 9).length;

  return (
    <PageWrapper title="My Team">

      {/* Team Summary Bar */}
      {!loading && team.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Team Members",   value: team.length,   color: "#6c63ff", icon: "👥" },
            { label: "Total Tasks",    value: totalTasks,    color: "#00d4aa", icon: "📋" },
            { label: "Completed",      value: totalDone,     color: "#22c55e", icon: "✅" },
            { label: "Overdue",        value: totalOverdue,  color: "#ef4444", icon: "⚠️" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 22 }}>{stat.icon}</div>
              <p className="text-2xl font-black mt-1" style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team members..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl outline-none text-sm"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
          <option value="name">Sort: Name</option>
          <option value="workload">Sort: Workload ↓</option>
          <option value="completion">Sort: Completion ↓</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading team...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>
            {search ? "No members found" : "No team members yet"}
          </p>
          <p className="text-sm mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
            Add members to your projects to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member, i) => {
            const total      = member.taskStats?.total      || 0;
            const done       = member.taskStats?.done       || 0;
            const completion = member.taskStats?.completion || 0;
            const overdue    = member.taskStats?.overdue    || 0;
            const breakdown  = member.taskStats?.statusBreakdown || {};
            const workload   = getWorkload(total);
            const isExpanded = expanded === member._id;

            return (
              <div key={member._id}
                className="rounded-2xl transition-all duration-300"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>

                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                        alt={member.name} className="w-12 h-12 rounded-xl"
                        style={{ border: `2px solid ${workload.color}` }} />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: member.isActive !== false ? "#22c55e" : "#6b6b8a", borderColor: cardBg }} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{member.name}</h3>
                      <p className="text-sm capitalize" style={{ color: "#00d4aa", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{member.role}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiMail size={12} style={{ color: muted }} />
                        <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{member.email}</p>
                      </div>
                    </div>

                    {/* Workload Badge */}
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ backgroundColor: workload.bg, color: workload.color, fontFamily: "DM Sans, sans-serif" }}>
                        {workload.label}
                      </span>
                      <p className="text-xs mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                        {total} tasks
                      </p>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                        Workload
                      </span>
                      <span className="text-xs font-bold" style={{ color: workload.color, fontFamily: "DM Sans, sans-serif" }}>
                        {total}/10 tasks
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0" }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((total / 10) * 100, 100)}%`, background: `linear-gradient(90deg, ${workload.bar}, ${workload.bar}aa)` }} />
                    </div>
                  </div>

                  {/* Completion Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                        Task Completion
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#00d4aa", fontFamily: "DM Sans, sans-serif" }}>
                        {completion}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,212,170,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${completion}%`, background: "linear-gradient(90deg, #00d4aa, #00f5c8)" }} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <FiCheckCircle size={12} style={{ color: "#22c55e" }} />
                        <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{done} done</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock size={12} style={{ color: "#f59e0b" }} />
                        <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{total - done} remaining</span>
                      </div>
                      {overdue > 0 && (
                        <div className="flex items-center gap-1">
                          <FiAlertCircle size={12} style={{ color: "#ef4444" }} />
                          <span className="text-xs font-semibold" style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>{overdue} overdue</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                      <div key={key} className="text-center p-2 rounded-xl"
                        style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                        <p className="text-base font-black" style={{ color: cfg.color, fontFamily: "Syne, sans-serif" }}>
                          {breakdown[key] || 0}
                        </p>
                        <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 10 }}>
                          {cfg.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  {member.projects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {member.projects.map(proj => (
                        <span key={proj._id || proj.name} className="text-xs px-2 py-1 rounded-lg"
                          style={{ backgroundColor: "rgba(108,99,255,0.1)", color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>
                          {proj.name || proj}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expand button */}
                  {member.tasks?.length > 0 && (
                    <button onClick={() => setExpanded(isExpanded ? null : member._id)}
                      className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", color: muted, fontFamily: "DM Sans, sans-serif", border: "none", cursor: "pointer" }}>
                      {isExpanded ? "▲ Hide tasks" : `▼ View ${member.tasks.length} tasks`}
                    </button>
                  )}
                </div>

                {/* Expanded Task List */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${border}`, padding: "12px 20px 16px" }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>ASSIGNED TASKS</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {member.tasks.map(task => {
                        const sc = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                        const subtasks = task.subtasks || [];
                        const doneSubs = subtasks.filter(s => s.isCompleted).length;
                        return (
                          <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 10, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${isOverdue ? "#ef444430" : border}` }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: sc.color, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: 12, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{task.title}</p>
                              <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
                                <span style={{ fontSize: 10, color: sc.color }}>{sc.label}</span>
                                {task.dueDate && (
                                  <span style={{ fontSize: 10, color: isOverdue ? "#ef4444" : muted }}>
                                    {isOverdue ? "⚠ overdue" : new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                )}
                                {subtasks.length > 0 && (
                                  <span style={{ fontSize: 10, color: "#6c63ff" }}>{doneSubs}/{subtasks.length} subs</span>
                                )}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, color: task.priority === "high" || task.priority === "critical" ? "#ef4444" : muted, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                              {task.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default MyTeam;