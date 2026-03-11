import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const ROLE_CONFIG = {
  admin: { color: "#ff6b35", bg: "rgba(255,107,53,0.1)" },
  manager: { color: "#00d4aa", bg: "rgba(0,212,170,0.1)" },
  employee: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const UserManagement = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "employee" });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";
  const rowHover = isDark ? "#1a1a2e" : "#f8fafc";

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.users || res || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "All" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Name, email and password required");
      return;
    }
    try {
      await api.post("/users", newUser);
      toast.success("User created!");
      setNewUser({ name: "", email: "", password: "", role: "employee" });
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted!");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      setEditId(null);
      toast.success("Role updated!");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const isActive = currentStatus === "active";
      await api.patch(`/users/${id}/activate`, { isActive: !isActive });
      toast.success("Status updated!");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <PageWrapper title="User Management">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-5" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
          >
            {["All", "admin", "manager", "employee"].map((r) => <option key={r}>{r}</option>)}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}
          >
            <FiPlus size={16} /> Add User
          </button>
        </div>

        {/* Add User Form */}
        {showAdd && (
          <div className="p-5" style={{ borderBottom: `1px solid ${border}`, backgroundColor: isDark ? "#0d0d18" : "#f8fafc" }}>
            <div className="flex flex-wrap gap-3">
              <input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name *"
                className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
              />
              <input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email *"
                className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
              />
              <input
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password *"
                type="password"
                className="flex-1 min-w-36 px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
              >
                {["employee", "manager", "admin"].map((r) => <option key={r}>{r}</option>)}
              </select>
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif" }}
              >
                Create
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
                style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", color: muted }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x p-0" style={{ borderBottom: `1px solid ${border}` }}>
          {[
            { label: "Total Users", value: users.length, color: "#ff6b35" },
            { label: "Active", value: users.filter((u) => u.isActive !== false).length, color: "#22c55e" },
            { label: "Managers", value: users.filter((u) => u.role === "manager").length, color: "#00d4aa" },
          ].map((stat) => (
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
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr
                    key={user._id}
                    className="transition-colors duration-150"
                    style={{ borderBottom: `1px solid ${border}`, animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: `linear-gradient(135deg, ${ROLE_CONFIG[user.role]?.color || "#6c63ff"}, ${ROLE_CONFIG[user.role]?.color || "#6c63ff"}aa)` }}
                        >
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{user.email}</td>
                    <td className="px-5 py-3">
                      {editId === user._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="px-2 py-1 rounded-lg outline-none text-xs"
                            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
                          >
                            {["employee", "manager", "admin"].map((r) => <option key={r}>{r}</option>)}
                          </select>
                          <button onClick={() => setEditId(null)} style={{ color: muted }}><FiX size={14} /></button>
                        </div>
                      ) : (
                        <span
                          className="text-xs px-2 py-1 rounded-lg font-medium capitalize"
                          style={{ backgroundColor: ROLE_CONFIG[user.role]?.bg, color: ROLE_CONFIG[user.role]?.color, fontFamily: "DM Sans, sans-serif" }}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleStatus(user._id, user.isActive !== false ? "active" : "inactive")}
                        className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: user.isActive !== false ? "rgba(34,197,94,0.1)" : "rgba(107,107,138,0.1)",
                          color: user.isActive !== false ? "#22c55e" : muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {user.isActive !== false ? "active" : "inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditId(user._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: "rgba(108,99,255,0.1)", color: "#6c63ff" }}
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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