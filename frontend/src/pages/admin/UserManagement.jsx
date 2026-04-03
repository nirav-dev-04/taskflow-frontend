import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const ROLE_CONFIG = {
  admin:    { color: "#ff6b35", bg: "rgba(255,107,53,0.1)" },
  manager:  { color: "#00d4aa", bg: "rgba(0,212,170,0.1)" },
  employee: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const getWorkload = (total) => {
  if (total === 0) return { label: "Free",       color: "#6b6b8a" };
  if (total <= 3)  return { label: "Light",      color: "#22c55e" };
  if (total <= 6)  return { label: "Normal",     color: "#00d4aa" };
  if (total <= 9)  return { label: "Busy",       color: "#f59e0b" };
  return            { label: "Overloaded",   color: "#ef4444" };
};

const UserManagement = () => {
  const { isDark } = useTheme();
  const [users, setUsers]       = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdd, setShowAdd]   = useState(false);
  const [editId, setEditId]     = useState(null);
  const [newUser, setNewUser]   = useState({ name: "", email: "", password: "", role: "employee" });

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";
  const rowHover = isDark ? "#1a1a2e" : "#f8fafc";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        api.get("/users"),
        api.get("/tasks"),
      ]);
      setUsers(usersRes.users || usersRes || []);
      setTasks(tasksRes.tasks || tasksRes || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Get task count per user
  const getTaskCount = (userId) =>
    tasks.filter(t => {
      const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
      return assignees.some(a => (a._id || a) === userId);
    }).length;

  const getDoneCount = (userId) =>
    tasks.filter(t => {
      const assignees = t.assignees || (t.assignee ? [t.assignee] : []);
      return assignees.some(a => (a._id || a) === userId) && t.status === "done";
    }).length;

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "All" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { toast.error("Name, email and password required"); return; }
    try {
      await api.post("/users", newUser);
      toast.success("User created!");
      setNewUser({ name: "", email: "", password: "", role: "employee" });
      setShowAdd(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create user"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted!");
      fetchData();
    } catch { toast.error("Failed to delete user"); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      setEditId(null);
      toast.success("Role updated!");
      fetchData();
    } catch { toast.error("Failed to update role"); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/activate`, { isActive: currentStatus !== "active" });
      toast.success("Status updated!");
      fetchData();
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <PageWrapper title="User Management">
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-5" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
            {["All", "admin", "manager", "employee"].map(r => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>
            <FiPlus size={16} /> Add User
          </button>
        </div>

        {/* Add User Form */}
        {showAdd && (
          <div className="p-5" style={{ borderBottom: `1px solid ${border}`, backgroundColor: isDark ? "#0d0d18" : "#f8fafc" }}>
            <div className="flex flex-wrap gap-3">
              <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name *" className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
              <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email *" className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
              <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password *" type="password" className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
                {["employee", "manager", "admin"].map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif" }}>
                Create
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
                style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 divide-x" style={{ borderBottom: `1px solid ${border}` }}>
          {[
            { label: "Total Users",  value: users.length,                                         color: "#ff6b35" },
            { label: "Active",       value: users.filter(u => u.isActive !== false).length,       color: "#22c55e" },
            { label: "Managers",     value: users.filter(u => u.role === "manager").length,       color: "#00d4aa" },
            { label: "Overloaded",   value: users.filter(u => getTaskCount(u._id) > 9).length,   color: "#ef4444" },
          ].map(stat => (
            <div key={stat.label} className="text-center py-4">
              <p className="text-2xl font-black" style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading users...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["User", "Email", "Role", "Workload", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const taskCount = getTaskCount(u._id);
                  const doneCount = getDoneCount(u._id);
                  const workload  = getWorkload(taskCount);
                  const completion = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

                  return (
                    <tr key={u._id} className="transition-colors duration-150"
                      style={{ borderBottom: `1px solid ${border}`, animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = rowHover}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>

                      {/* User */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: `linear-gradient(135deg, ${ROLE_CONFIG[u.role]?.color || "#6c63ff"}, ${ROLE_CONFIG[u.role]?.color || "#6c63ff"}aa)` }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{u.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3">
                        {editId === u._id ? (
                          <div className="flex items-center gap-2">
                            <select defaultValue={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                              className="px-2 py-1 rounded-lg outline-none text-xs"
                              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
                              {["employee", "manager", "admin"].map(r => <option key={r}>{r}</option>)}
                            </select>
                            <button onClick={() => setEditId(null)} style={{ color: muted }}><FiX size={14} /></button>
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-lg font-medium capitalize"
                            style={{ backgroundColor: ROLE_CONFIG[u.role]?.bg, color: ROLE_CONFIG[u.role]?.color, fontFamily: "DM Sans, sans-serif" }}>
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Workload — NEW */}
                      <td className="px-5 py-3">
                        <div style={{ minWidth: 110 }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: workload.color, fontFamily: "DM Sans, sans-serif" }}>
                              {workload.label}
                            </span>
                            <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                              {doneCount}/{taskCount}
                            </span>
                          </div>
                          <div style={{ height: 4, borderRadius: 4, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min((taskCount / 10) * 100, 100)}%`, backgroundColor: workload.color, borderRadius: 4, transition: "width 0.5s" }} />
                          </div>
                          <p style={{ fontSize: 10, color: muted, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>
                            {completion}% complete
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <button onClick={() => toggleStatus(u._id, u.isActive !== false ? "active" : "inactive")}
                          className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:scale-105"
                          style={{ backgroundColor: u.isActive !== false ? "rgba(34,197,94,0.1)" : "rgba(107,107,138,0.1)", color: u.isActive !== false ? "#22c55e" : muted, fontFamily: "DM Sans, sans-serif" }}>
                          {u.isActive !== false ? "active" : "inactive"}
                        </button>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3 text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditId(u._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: "rgba(108,99,255,0.1)", color: "#6c63ff" }}>
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(u._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>No users found</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default UserManagement;