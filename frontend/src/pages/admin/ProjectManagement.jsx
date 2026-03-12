import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import {
  FiSearch, FiPlus, FiTrash2, FiUsers, FiCalendar,
  FiCheckCircle, FiX, FiArrowLeft, FiUserPlus, FiUserMinus,
  FiClipboard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  critical: { color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
};

const STATUS_CONFIG = {
  planning:  { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  active:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  on_hold:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  done: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const COLORS = ["#6c63ff", "#00d4aa", "#ff6b35", "#a78bfa", "#22c55e", "#f59e0b"];
const getColor = (i) => COLORS[i % COLORS.length];

const Avatar = ({ name = "?", size = 32, color = "#6c63ff" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}, ${color}aa)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 700, fontSize: size * 0.38,
    fontFamily: "Syne, sans-serif", flexShrink: 0,
  }}>
    {name[0]?.toUpperCase()}
  </div>
);

// ── Project Detail Modal ──────────────────────────────────────────────────────
const ProjectDetail = ({ project, allUsers, isDark, onClose, onRefresh }) => {
  const [tasks, setTasks]               = useState([]);
  const [members, setMembers]           = useState(project.members || []);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", dueDate: "", assignees: [] });
  const [selectedUserId, setSelectedUserId] = useState("");

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const overlayBg = isDark ? "#0a0a0f" : "#f1f5f9";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.get(`/tasks?project=${project._id}`);
      setTasks(res.tasks || res || []);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoadingTasks(false); }
  };

  useEffect(() => { fetchTasks(); }, [project._id]);

  const memberIds  = members.map(m => m._id || m);
  const nonMembers = allUsers.filter(u => !memberIds.includes(u._id) && u.role === "employee");

  const handleAddMember = async () => {
    if (!selectedUserId) { toast.error("Select a user"); return; }
    try {
      const res = await api.post(`/projects/${project._id}/members`, { userId: selectedUserId });
      setMembers((res.project || res).members || []);
      setSelectedUserId("");
      setShowAddMember(false);
      toast.success("Member added!");
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add member"); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const res = await api.delete(`/projects/${project._id}/members/${userId}`);
      setMembers((res.project || res).members || []);
      toast.success("Member removed");
      onRefresh();
    } catch { toast.error("Failed to remove member"); }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) { toast.error("Task title required"); return; }
    try {
      await api.post("/tasks", {
        title: newTask.title,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        assignees: newTask.assignees,
        project: project._id,
      });
      toast.success("Task created!");
      setNewTask({ title: "", priority: "medium", dueDate: "", assignees: [] });
      setShowAddTask(false);
      fetchTasks();
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create task"); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      fetchTasks();
      onRefresh();
    } catch { toast.error("Failed to delete task"); }
  };

  const statusLabel = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
  const statusColor = { todo: "#6b6b8a", in_progress: "#3b82f6", review: "#f59e0b", done: "#22c55e" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: overlayBg, borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", border: `1px solid ${border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted, display: "flex" }}><FiArrowLeft size={20} /></button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 18, fontWeight: 700 }}>{project.name}</h2>
            <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>
              Manager: {project.manager?.name || "Unassigned"} &nbsp;•&nbsp;
              <span style={{ color: STATUS_CONFIG[project.status]?.color }}>{project.status?.replace("_", " ")}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><FiX size={20} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Members */}
          <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <FiUsers size={16} /> Members ({members.length})
              </h3>
              <button onClick={() => setShowAddMember(!showAddMember)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6c63ff, #8b85ff)", color: "white", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                <FiUserPlus size={13} /> Add Member
              </button>
            </div>

            {showAddMember && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: inputBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}>
                  <option value="">Select user to add...</option>
                  {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <button onClick={handleAddMember}
                  style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Add</button>
                <button onClick={() => setShowAddMember(false)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted }}><FiX size={14} /></button>
              </div>
            )}

            {members.length === 0 ? (
              <p style={{ color: muted, fontSize: 13, fontFamily: "DM Sans, sans-serif", textAlign: "center", padding: "12px 0" }}>
                No members yet. Click "Add Member" to add employees!
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {members.map((m, i) => {
                  const member = typeof m === "object" ? m : allUsers.find(u => u._id === m);
                  if (!member) return null;
                  return (
                    <div key={member._id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 20, backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", border: `1px solid ${border}` }}>
                      <Avatar name={member.name} size={24} color={getColor(i)} />
                      <span style={{ fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif" }}>{member.name}</span>
                      <span style={{ fontSize: 11, color: muted }}>({member.role})</span>
                      <button onClick={() => handleRemoveMember(member._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: 0 }}>
                        <FiUserMinus size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", color: text, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <FiClipboard size={16} /> Tasks ({tasks.length})
              </h3>
              <button onClick={() => setShowAddTask(!showAddTask)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                <FiPlus size={13} /> Add Task
              </button>
            </div>

            {showAddTask && (
              <div style={{ backgroundColor: inputBg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title *"
                    style={{ gridColumn: "1/-1", padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}>
                    {["low", "medium", "high", "critical"].map(p => <option key={p}>{p}</option>)}
                  </select>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                  <select style={{ gridColumn: "1/-1", padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: cardBg, color: text, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}
                    onChange={e => {
                      const id = e.target.value;
                      if (id && !newTask.assignees.includes(id))
                        setNewTask(prev => ({ ...prev, assignees: [...prev.assignees, id] }));
                      e.target.value = "";
                    }}>
                    <option value="">Assign to member...</option>
                    {members.map((m, i) => {
                      const member = typeof m === "object" ? m : allUsers.find(u => u._id === m);
                      return member ? <option key={member._id} value={member._id}>{member.name}</option> : null;
                    })}
                  </select>
                  {newTask.assignees.length > 0 && (
                    <div style={{ gridColumn: "1/-1", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {newTask.assignees.map(id => {
                        const u = allUsers.find(u => u._id === id);
                        return u ? (
                          <span key={id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", fontSize: 12, color: text, fontFamily: "DM Sans, sans-serif" }}>
                            {u.name}
                            <button onClick={() => setNewTask(prev => ({ ...prev, assignees: prev.assignees.filter(a => a !== id) }))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex" }}>
                              <FiX size={11} />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleCreateTask}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                    Create Task
                  </button>
                  <button onClick={() => setShowAddTask(false)}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {loadingTasks ? (
              <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: muted, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13, padding: "12px 0" }}>
                No tasks yet. Click "Add Task" to create the first one!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map(task => {
                  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const sc = statusColor[task.status] || "#6b6b8a";
                  return (
                    <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, backgroundColor: isDark ? "#0d0d18" : "#f8fafc", border: `1px solid ${border}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: sc, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{task.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: sc }}>{statusLabel[task.status] || task.status}</span>
                          <span style={{ fontSize: 11, color: pc.color }}>{task.priority}</span>
                          {task.dueDate && <span style={{ fontSize: 11, color: muted }}>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex" }}>
                        {(task.assignees || []).slice(0, 3).map((a, i) => {
                          const user = typeof a === "object" ? a : allUsers.find(u => u._id === a);
                          return user ? <Avatar key={i} name={user.name} size={26} color={getColor(i)} /> : null;
                        })}
                      </div>
                      <button onClick={() => handleDeleteTask(task._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex" }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProjectManagement = () => {
  const { isDark } = useTheme();
  const [projects, setProjects]               = useState([]);
  const [allUsers, setAllUsers]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [filterStatus, setFilterStatus]       = useState("All");
  const [showAdd, setShowAdd]                 = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", managerId: "", dueDate: "", priority: "medium" });

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";
  const managers = allUsers.filter(u => u.role === "manager" || u.role === "admin");

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
      setAllUsers(res.users || res || []);
    } catch {}
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus.toLowerCase().replace("-", "_");
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
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create project"); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted!");
      fetchProjects();
    } catch { toast.error("Failed to delete project"); }
  };

  return (
    <PageWrapper title="Project Management">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl outline-none text-sm"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
          {["All", "Planning", "Active", "On-Hold", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: cardBg, border: `1px solid #ff6b3550`, animation: "slideUp 0.3s ease" }}>
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: text }}>New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Project Name *" className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <input value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Description" className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.managerId} onChange={e => setNewProject({ ...newProject, managerId: e.target.value })}
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              <option value="">Select Manager</option>
              {managers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={newProject.dueDate} onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            <select value={newProject.priority} onChange={e => setNewProject({ ...newProject, priority: e.target.value })}
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
              {["high", "medium", "low"].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAdd}
                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif" }}>
                Create Project
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
                style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted, fontFamily: "DM Sans, sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const color    = getColor(i);
            const status   = project.status || "planning";
            const priority = project.priority || "medium";
            const sc = STATUS_CONFIG[status]    || STATUS_CONFIG.planning;
            const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
            return (
              <div key={project._id}
                onClick={() => setSelectedProject(project)}
                className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)", animation: `slideUp 0.4s ease ${i * 0.08}s both` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontFamily: "Syne, sans-serif" }}>
                      {project.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{project.name}</h3>
                      <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>by {project.manager?.name || "Unassigned"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: muted, fontFamily: "DM Sans, sans-serif", backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                    Click to open
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize"
                    style={{ backgroundColor: sc.bg, color: sc.color, fontFamily: "DM Sans, sans-serif" }}>
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium capitalize"
                    style={{ backgroundColor: pc.bg, color: pc.color, fontFamily: "DM Sans, sans-serif" }}>
                    {priority}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Progress</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: "DM Sans, sans-serif" }}>{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1">
                    <FiUsers size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{project.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCheckCircle size={13} style={{ color }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>0/{project.tasks?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar size={13} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}
                    </span>
                  </div>
                  <button onClick={e => handleDelete(e, project._id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-12">
              <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No projects found</p>
            </div>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          allUsers={allUsers}
          isDark={isDark}
          onClose={() => setSelectedProject(null)}
          onRefresh={fetchProjects}
        />
      )}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default ProjectManagement;