import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";
import api from "../../services/api";

const MyTeam = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
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
        const allUsers = usersRes.users || usersRes || [];
        const allTasks = tasksRes.tasks || tasksRes || [];

        // Get members from manager's projects
        const managed = allProjects.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        const memberIds = new Set();
        const memberProjects = {};
        managed.forEach(p => {
          (p.members || []).forEach(m => {
            const id = m._id || m;
            memberIds.add(id);
            if (!memberProjects[id]) memberProjects[id] = [];
            memberProjects[id].push(p.name);
          });
        });

        const teamUsers = allUsers.filter(u => memberIds.has(u._id));
        // Attach task stats
        const teamWithStats = teamUsers.map(u => {
          const userTasks = allTasks.filter(t => {
            const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
            return assignees.some(a => (a._id || a) === u._id);
          });
          return {
            ...u,
            taskStats: { total: userTasks.length, done: userTasks.filter(t => t.status === "completed").length },
            projects: memberProjects[u._id] || [],
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

  const filtered = team.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="My Team">
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team members..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
          style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
      </div>

      {loading ? (
        <div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading team...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>{search ? "No members found" : "No team members yet"}</p>
          <p className="text-sm mt-1" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Add members to your projects to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member, i) => {
            const total = member.taskStats?.total || 0;
            const done = member.taskStats?.done || 0;
            const completion = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={member._id} className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name}
                      className="w-12 h-12 rounded-xl" style={{ border: "2px solid #00d4aa" }} />
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
                  <span className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: member.isActive !== false ? "rgba(34,197,94,0.1)" : "rgba(107,107,138,0.1)", color: member.isActive !== false ? "#22c55e" : muted, fontFamily: "DM Sans, sans-serif" }}>
                    {member.isActive !== false ? "active" : "inactive"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Task Completion</span>
                    <span className="text-xs font-bold" style={{ color: "#00d4aa", fontFamily: "DM Sans, sans-serif" }}>{completion}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,212,170,0.1)" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${completion}%`, background: "linear-gradient(90deg, #00d4aa, #00f5c8)" }} />
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
                  </div>
                </div>

                {member.projects.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${border}` }}>
                    {member.projects.map(proj => (
                      <span key={proj} className="text-xs px-2 py-1 rounded-lg"
                        style={{ backgroundColor: "rgba(0,212,170,0.1)", color: "#00d4aa", fontFamily: "DM Sans, sans-serif" }}>{proj}</span>
                    ))}
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