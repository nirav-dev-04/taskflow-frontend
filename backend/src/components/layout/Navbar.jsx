import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiSun, FiMoon, FiBell, FiSearch } from "react-icons/fi";

const ROLE_CONFIG = {
  admin: {
    color: "#ff6b35",
    gradient: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
    label: "Admin",
  },
  manager: {
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #00f5c8)",
    label: "Manager",
  },
  employee: {
    color: "#a78bfa",
    gradient: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
    label: "Employee",
  },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "New task assigned to you", time: "2m ago", unread: true },
  { id: 2, text: "Project deadline tomorrow", time: "1h ago", unread: true },
  { id: 3, text: "Comment on your task", time: "3h ago", unread: false },
];

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");

  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const navBg = isDark ? "#0d0d18" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#12121f" : "#f8fafc";
  const cardBg = isDark ? "#12121f" : "#ffffff";

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6"
      style={{
        backgroundColor: navBg,
        borderBottom: `1px solid ${border}`,
        height: "64px",
        boxShadow: isDark
          ? "0 2px 20px rgba(0,0,0,0.3)"
          : "0 2px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Left — Page Title */}
      <div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: "Syne, sans-serif", color: text }}
        >
          {title || "Dashboard"}
        </h1>
        <p
          className="text-xs"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: muted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all duration-300"
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${border}`,
              color: text,
              fontFamily: "DM Sans, sans-serif",
              width: "200px",
            }}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: inputBg,
            border: `1px solid ${border}`,
            color: text,
          }}
        >
          {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${border}`,
              color: text,
            }}
          >
            <FiBell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#ef4444", fontSize: "10px" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${border}`,
                boxShadow: isDark
                  ? "0 8px 40px rgba(0,0,0,0.5)"
                  : "0 8px 40px rgba(0,0,0,0.12)",
                animation: "slideInRight 0.2s ease forwards",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${border}` }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: text, fontFamily: "Syne, sans-serif" }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{
                      color: config.color,
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors duration-200 cursor-pointer"
                    style={{
                      backgroundColor: notif.unread
                        ? `${config.color}08`
                        : "transparent",
                      borderBottom: `1px solid ${border}`,
                    }}
                    onClick={() =>
                      setNotifications(
                        notifications.map((n) =>
                          n.id === notif.id ? { ...n, unread: false } : n,
                        ),
                      )
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: notif.unread
                          ? config.color
                          : "transparent",
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-sm"
                        style={{
                          color: text,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {notif.text}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color: muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
            }
            alt={user?.name}
            className="w-9 h-9 rounded-xl object-cover"
            style={{ border: `2px solid ${config.color}` }}
          />
          <div className="hidden md:block">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
            >
              {user?.name}
            </p>
            <p
              className="text-xs leading-tight"
              style={{
                color: config.color,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
              }}
            >
              {config.label}
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
