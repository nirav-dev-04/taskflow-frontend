import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiUsers, FiCalendar, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";

const COLORS = ["#6c63ff", "#00d4aa", "#a78bfa", "#ff6b35", "#22c55e", "#f59e0b"];

const EmployeeProjects = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const allProjects = res.projects || res || [];
        // Filter projects where user is a member
        const myProjects = allProjects.filter(p => {
          const members = p.members || [];
          return members.some(m => (m._id || m) === user?._id) || p.manager?._id === user?._id;
        });
        setProjects(myProjects);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchProjects();
  }, [user]);

  if (loading) return <PageWrapper title="My Projects"><div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: isDark ? "#6b6b8a" : "#64748b", fontFamily: "Syne, sans-serif" }}>Loading projects...</p></div></PageWrapper>;

  return (
    <PageWrapper title="My Projects">
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold" style={{ color: isDark ? "#6b6b8a" : "#64748b", fontFamily: "Syne, sans-serif" }}>No projects assigned yet</p>
          <p className="text-sm mt-1" style={{ color: isDark ? "#6b6b8a" : "#64748b", fontFamily: "DM Sans, sans-serif" }}>Ask your manager to add you to a project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const color = COLORS[i % COLORS.length];
            const total = project.tasks?.length || 0;
            const done = project.tasks?.filter(t => t.status === "completed").length || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const statusColors = { active: "#22c55e", completed: "#6c63ff", "on-hold": "#f59e0b", planning: "#06b6d4" };
            const statusColor = statusColors[project.status] || "#22c55e";

            return (
              <div key={project._id} className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontFamily: "Syne, sans-serif" }}>
                    {project.name?.[0] || "P"}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg font-medium capitalize"
                    style={{ backgroundColor: `${statusColor}15`, color: statusColor, fontFamily: "DM Sans, sans-serif" }}>
                    {project.status || "Active"}
                  </span>
                </div>

                <h3 className="text-base font-bold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{project.name}</h3>
                <p className="text-xs mb-1" style={{ color, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                  {project.manager?._id === user?._id ? "Manager" : "Member"}
                </p>
                {project.description && (
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Progress</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1">
                    <FiUsers size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCheckCircle size={13} style={{ color }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{done}/{total} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default EmployeeProjects;