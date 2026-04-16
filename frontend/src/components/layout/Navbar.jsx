import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiBell, FiSearch, FiX, FiCheck, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
  admin:    { color: "#ff6b35", gradient: "linear-gradient(135deg, #ff6b35, #ff8c5a)", label: "Admin" },
  manager:  { color: "#00d4aa", gradient: "linear-gradient(135deg, #00d4aa, #00f5c8)", label: "Manager" },
  employee: { color: "#a78bfa", gradient: "linear-gradient(135deg, #a78bfa, #c4b5fd)", label: "Employee" },
};

const Navbar = ({ title }) => {
  const { user }          = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate          = useNavigate();
  const bellRef           = useRef(null);
  const searchRef         = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]         = useState([]);
  const [loadingNotifs, setLoadingNotifs]         = useState(false);
  const [searchQuery, setSearchQuery]             = useState("");
  const [searchResults, setSearchResults]         = useState([]);
  const [showSearch, setShowSearch]               = useState(false);
  const [searchLoading, setSearchLoading]         = useState(false);

  const config       = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  const unreadCount  = notifications.filter(n => !n.isRead).length;

  const navBg   = isDark ? "#0d0d18" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#12121f" : "#f8fafc";
  const cardBg  = isDark ? "#12121f" : "#ffffff";

  // ── Fetch notifications from real API ────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get("/notifications");
      setNotifications(res.notifications || res || []);
    } catch { /* silent */ }
    finally { setLoadingNotifs(false); }
  };

  useEffect(() => {
    if (user?._id) fetchNotifications();
  }, [user]);

  // ── Mark single as read ───────────────────────────────────────────────────
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed to mark all as read"); }
  };

  // ── Delete single notification ────────────────────────────────────────────
  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* silent */ }
  };

  // ── Clear all notifications ───────────────────────────────────────────────
  const clearAll = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch { toast.error("Failed to clear notifications"); }
  };

  // ── Close bell on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  // ── Search across tasks + projects ───────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);
        const tasks    = (tasksRes.tasks    || tasksRes    || []).filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()));
        const projects = (projectsRes.projects || projectsRes || []).filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchResults([
          ...tasks.slice(0, 4).map(t => ({ type: "task", label: t.title, sub: t.project?.name || "Task", id: t._id })),
          ...projects.slice(0, 3).map(p => ({ type: "project", label: p.name, sub: "Project", id: p._id })),
        ]);
      } catch { /* silent */ }
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Navigate to search result ─────────────────────────────────────────────
  const handleResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    if (result.type === "task")    navigate(user?.role === "employee" ? "/employee/tasks" : user?.role === "manager" ? "/manager/projects" : "/admin/projects");
    if (result.type === "project") navigate(user?.role === "admin" ? "/admin/projects" : user?.role === "manager" ? "/manager/projects" : "/employee/projects");
  };

  // ── Close search on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) { setShowSearch(false); setSearchResults([]); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6"
      style={{ backgroundColor: navBg, borderBottom: `1px solid ${border}`, height: "64px", boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.06)" }}>

      {/* Left — Page Title */}
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>{title || "Dashboard"}</h1>
        <p className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">

        {/* ── Search ── */}
        <div ref={searchRef} className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search tasks, projects..."
            className="pl-9 pr-8 py-2 rounded-xl text-sm outline-none transition-all duration-300"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif", width: "220px" }} />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: muted }}>
              <FiX size={13} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute right-0 top-11 w-72 rounded-2xl overflow-hidden z-50"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.12)" }}>
              {searchLoading ? (
                <div className="px-4 py-3 text-center">
                  <p style={{ fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-center">
                  <p style={{ fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>No results for "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif", padding: "8px 14px 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Results ({searchResults.length})
                  </p>
                  {searchResults.map((r, i) => (
                    <div key={i} onClick={() => handleResultClick(r)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                      style={{ borderTop: `1px solid ${border}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e1e30" : "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: r.type === "task" ? "rgba(108,99,255,0.12)" : "rgba(0,212,170,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                        {r.type === "task" ? "📋" : "📁"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</p>
                        <p style={{ margin: 0, fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>{r.sub}</p>
                      </div>
                      <span style={{ fontSize: 10, color: r.type === "task" ? "#6c63ff" : "#00d4aa", backgroundColor: r.type === "task" ? "rgba(108,99,255,0.1)" : "rgba(0,212,170,0.1)", padding: "2px 6px", borderRadius: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                        {r.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Theme Toggle ── */}
        <button onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text }}>
          {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        {/* ── Notifications Bell ── */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text }}>
            <FiBell size={16} style={{ animation: unreadCount > 0 ? "bellRing 2s ease infinite" : "none" }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "#ef4444", fontSize: "10px" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.12)", animation: "slideInRight 0.2s ease forwards", maxHeight: 440 }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: text, fontFamily: "Syne, sans-serif" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#ef4444" }}>{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={fetchNotifications} title="Refresh" style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "4px" }}>
                    <FiSearch size={13} />
                  </button>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} title="Mark all read" style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: "4px" }}>
                      <FiCheck size={13} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} title="Clear all" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}>
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {loadingNotifs ? (
                  <div className="text-center py-6">
                    <p style={{ fontSize: 12, color: muted, fontFamily: "DM Sans, sans-serif" }}>Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <p style={{ fontSize: 24, marginBottom: 8 }}>🔔</p>
                    <p style={{ fontSize: 13, color: muted, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>No notifications</p>
                    <p style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id}
                      onClick={() => { markAsRead(n._id); if (n.link) navigate(n.link); }}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group"
                      style={{ backgroundColor: !n.isRead ? (isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.03)") : "transparent", borderBottom: `1px solid ${border}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e1e30" : "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.isRead ? (isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.03)") : "transparent"}>
                      {/* Unread dot */}
                      {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3b82f6", flexShrink: 0, marginTop: 6 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: text, fontFamily: "DM Sans, sans-serif", fontWeight: !n.isRead ? 600 : 400, lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      <button onClick={e => deleteNotif(n._id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px", flexShrink: 0 }}>
                        <FiX size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 text-center" style={{ borderTop: `1px solid ${border}` }}>
                  <p style={{ fontSize: 11, color: muted, fontFamily: "DM Sans, sans-serif" }}>
                    <span style={{ color: text, fontWeight: 700 }}>{unreadCount}</span> unread · {notifications.length} total
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Avatar ── */}
        <div className="flex items-center gap-2">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name}
            className="w-9 h-9 rounded-xl object-cover" style={{ border: `2px solid ${config.color}` }} />
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{user?.name}</p>
            <p className="text-xs leading-tight" style={{ color: config.color, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{config.label}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { 0% { opacity: 0; transform: translateX(10px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes bellRing { 0%,100%{transform:rotate(0deg)} 10%{transform:rotate(14deg)} 20%{transform:rotate(-12deg)} 30%{transform:rotate(10deg)} 40%{transform:rotate(-8deg)} 50%{transform:rotate(6deg)} 60%{transform:rotate(-4deg)} 70%{transform:rotate(2deg)} }
      `}</style>
    </header>
  );
};

export default Navbar;