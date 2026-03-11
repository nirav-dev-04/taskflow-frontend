import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiSearch, FiPlus, FiTrash2, FiUsers, FiCalendar, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const STATUS_CONFIG = {
  active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  completed: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  "on-hold": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  archived: { color: "#6b6b8a", bg: "rgba(107,107,138,0.1)" },
};

const COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];

const ProjectManagement = () => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", managerId: "", dueDate: "", priority: "medium" });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.projects || res || []);
    } catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      const allUsers = res.users || res || [];
      setUsers(allUsers.filter(u => u.role === "manager" || u.role === "admin"));
    } catch {}
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    if (!newProject.name) { toast.error("Project name required"); return; }
    try {
      await api.post("/projects", {
        name: newProject.name,
        description: newProject.description,
        manager: newProject.managerId || undefined,
        dueDate: newProject.dueDate || undefined,
        priority: newProject.priority,
      });
      toast.success("Project created!");
      setNewProject({ name: "", description: "", managerId: "", dueDate: "", priority: "medium" });
      setShowAdd(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted!");
      fetchProjects();
    } catch { toast.error("Failed to delete project"); }
  };

  const getProgress = (project) => {
    const total = project.tasks?.length || 0;
    if (total === 0) return 0;
    const done = project.tasks?.filter(t => t.status === "completed").length || 0;
    return Math.round((done / total) * 100);
  };

  const getColor = (index) => COLORS[index % COLORS.length];

  return (
    <PageWrapper title="Project Management">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
          {["All", "Active", "Completed", "On-Hold", "Archived"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: cardBg, border: `1px solid #ff6b3550`, animation: "slideUp 0.3s ease" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project Name *" className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <input value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.managerId} onChange={(e) => setNewProject({ ...newProject, managerId: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              <option value="">Select Manager</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={newProject.dueDate} onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.priority} onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })} className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              {["high", "medium", "low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif" }}>Create Project</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105" style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading projects...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const color = getColor(i);
            const progress = getProgress(project);
            const status = project.status || "active";
            const priority = project.priority || "medium";
            return (
              <div key={project._id} className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.08}s both` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontFamily: "Syne, sans-serif" }}>
                      {project.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{project.name}</h3>
                      <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>by {project.manager?.name || "Unassigned"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize" style={{ backgroundColor: STATUS_CONFIG[status]?.bg, color: STATUS_CONFIG[status]?.color, fontFamily: "DM Sans, sans-serif" }}>{status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize" style={{ backgroundColor: PRIORITY_CONFIG[priority]?.bg, color: PRIORITY_CONFIG[priority]?.color, fontFamily: "DM Sans, sans-serif" }}>{priority}</span>
                </div>

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
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      {project.tasks?.filter(t => t.status === "completed").length || 0}/{project.tasks?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(project._id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12"><p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No projects found</p></div>
          )}
        </div>
      )}
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default ProjectManagement;