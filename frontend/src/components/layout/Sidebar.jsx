import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  MdDashboard,
  MdPeople,
  MdFolder,
  MdAnalytics,
  MdSettings,
  MdTask,
  MdCalendarToday,
  MdPerson,
  MdSpaceDashboard,
} from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiLogOut } from "react-icons/fi";
import { HiOutlineViewBoards } from "react-icons/hi";
import { BsPeopleFill, BsBarChartFill } from "react-icons/bs";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
  admin: {
    color: "#ff6b35",
    gradient: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
    glow: "rgba(255,107,53,0.2)",
    label: "Admin",
    nav: [
      { label: "Dashboard", icon: MdDashboard, path: "/admin/dashboard" },
      { label: "Users", icon: MdPeople, path: "/admin/users" },
      { label: "Projects", icon: MdFolder, path: "/admin/projects" },
      { label: "Analytics", icon: MdAnalytics, path: "/admin/analytics" },
      { label: "Settings", icon: MdSettings, path: "/admin/settings" },
    ],
  },
  manager: {
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #00f5c8)",
    glow: "rgba(0,212,170,0.2)",
    label: "Manager",
    nav: [
      { label: "Dashboard", icon: MdDashboard, path: "/manager/dashboard" },
      { label: "My Projects", icon: MdFolder, path: "/manager/projects" },
      { label: "My Team", icon: BsPeopleFill, path: "/manager/team" },
      {
        label: "Sprint Board",
        icon: HiOutlineViewBoards,
        path: "/manager/sprint",
      },
      { label: "Reports", icon: BsBarChartFill, path: "/manager/reports" },
    ],
  },
  employee: {
    color: "#a78bfa",
    gradient: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
    glow: "rgba(167,139,250,0.2)",
    label: "Employee",
    nav: [
      { label: "Dashboard", icon: MdDashboard, path: "/employee/dashboard" },
      { label: "My Tasks", icon: MdTask, path: "/employee/tasks" },
      { label: "My Projects", icon: MdFolder, path: "/employee/projects" },
      { label: "Calendar", icon: MdCalendarToday, path: "/employee/calendar" },
      { label: "Profile", icon: MdPerson, path: "/employee/profile" },
    ],
  },
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;

  const sidebarBg = isDark ? "#0d0d18" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const hoverBg = isDark ? "#1a1a2e" : "#f8fafc";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 z-40"
      style={{
        width: collapsed ? "72px" : "240px",
        backgroundColor: sidebarBg,
        borderRight: `1px solid ${border}`,
        boxShadow: isDark
          ? "4px 0 24px rgba(0,0,0,0.3)"
          : "4px 0 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between p-4 mb-2"
        style={{ borderBottom: `1px solid ${border}`, minHeight: "64px" }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-2"
            style={{ animation: "fadeIn 0.3s ease" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: config.gradient }}
            >
              <MdSpaceDashboard size={18} color="white" />
            </div>
            <span
              className="text-lg font-black"
              style={{
                fontFamily: "Syne, sans-serif",
                background: config.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TaskFlow
            </span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: config.gradient }}
          >
            <MdSpaceDashboard size={18} color="white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: hoverBg, color: muted }}
          >
            <FiChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <div className="flex justify-center mb-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: hoverBg, color: muted }}
          >
            <FiChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 mb-4" style={{ animation: "fadeIn 0.3s ease" }}>
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-center"
            style={{
              backgroundColor: `${config.color}15`,
              color: config.color,
              border: `1px solid ${config.color}30`,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {config.label} Panel
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {config.nav.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={{
                backgroundColor: isActive ? `${config.color}15` : "transparent",
                border: isActive
                  ? `1px solid ${config.color}30`
                  : "1px solid transparent",
                color: isActive ? config.color : muted,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? label : ""}
            >
              <Icon
                size={20}
                style={{
                  flexShrink: 0,
                  filter: isActive
                    ? `drop-shadow(0 0 6px ${config.color})`
                    : "none",
                }}
              />
              {!collapsed && (
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    color: isActive ? config.color : text,
                  }}
                >
                  {label}
                </span>
              )}
              {isActive && !collapsed && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 mt-2" style={{ borderTop: `1px solid ${border}` }}>
        {!collapsed ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div
              className="flex items-center gap-3 p-2 rounded-xl mb-2"
              style={{ backgroundColor: hoverBg }}
            >
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full shrink-0"
                style={{ border: `2px solid ${config.color}` }}
              />
              <div className="overflow-hidden">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                >
                  {user?.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <FiLogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full"
              style={{ border: `2px solid ${config.color}` }}
            />
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "#ef4444",
              }}
              title="Logout"
            >
              <FiLogOut size={15} />
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
    </aside>
  );
};

export default Sidebar;
