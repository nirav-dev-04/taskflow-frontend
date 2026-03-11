import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiUsers, FiCalendar, FiPlus, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];
const PRIORITY_CONFIG = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const MyProjects = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", dueDate: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      const all = res.projects || res || [];
      // Show projects managed by this user
      const mine = all.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
      setProjects(mine);
    } catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?._id) fetchProjects(); }, [user]);

  const handleAdd = async () => {
    if (!newProject.name) { toast.error("Project name required"); return; }
    try {
      setSaving(true);
      await api.post("/projects", { ...newProject, manager: user?._id });
      toast.success("Project created!");
      setNewProject({ name: "", description: "", dueDate: "", priority: "medium" });
      setShowAdd(false);
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create project");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted!");
      fetchProjects();
    } catch { toast.error("Failed to delete project"); }
  };

  return (
    <PageWrapper title="My Projects">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          Managing <span style={{ color: "#00d4aa", fontWeight: 600 }}>{projects.length}</span> projects
        </p>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #00d4aa, #00f5c8)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(0,212,170,0.3)" }}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: cardBg, border: "1px solid #00d4aa50", animation: "slideUp 0.3s ease" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project Name *"
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <input type="date" value={newProject.dueDate} onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <input value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description"
              className="px-4 py-2.5 rounded-xl outline-none text-sm md:col-span-2" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.priority} onChange={e => setNewProject({ ...newProject, priority: e.target.value })}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              {["high", "medium", "low"].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #00d4aa, #00f5c8)", color: "white", fontFamily: "DM Sans, sans-serif", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Creating..." : "Create Project"}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading projects...</p></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No projects yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const color = COLORS[i % COLORS.length];
            const total = project.tasks?.length || 0;
            const done = project.tasks?.filter(t => t.status === "completed").length || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const priority = project.priority || "medium";
            const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
            return (
              <div key={project._id} className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontFamily: "Syne, sans-serif" }}>
                    {project.name?.[0] || "P"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg font-medium capitalize" style={{ backgroundColor: pc.bg, color: pc.color, fontFamily: "DM Sans, sans-serif" }}>{priority}</span>
                    <button onClick={() => handleDelete(project._id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{project.name}</h3>
                {project.description && <p className="text-xs mb-4 line-clamp-2" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.description}</p>}

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Progress</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1">
                    <FiUsers size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCheckCircle size={13} style={{ color }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{done}/{total}</span>
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

export default MyProjects;