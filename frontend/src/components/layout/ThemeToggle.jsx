import { useTheme } from "../../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle({ collapsed = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group"
      style={{
        background: isDark ? "#1e1e30" : "#f1f5f9",
        border: `1px solid ${isDark ? "#2a2a40" : "#e2e8f0"}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "#2a2a40" : "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "#1e1e30" : "#f1f5f9";
      }}
    >
      {/* Track */}
      <div
        className="relative shrink-0 w-10 h-5 rounded-full transition-all duration-300"
        style={{
          background: isDark
            ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
            : "linear-gradient(135deg,#f59e0b,#f97316)",
          boxShadow: isDark
            ? "0 0 10px rgba(59,130,246,0.4)"
            : "0 0 10px rgba(245,158,11,0.4)",
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
          style={{
            left: isDark ? "calc(100% - 1.125rem)" : "0.125rem",
            background: "#ffffff",
          }}
        >
          {isDark ? (
            <FiMoon size={9} color="#3b82f6" strokeWidth={2.5} />
          ) : (
            <FiSun size={9} color="#f59e0b" strokeWidth={2.5} />
          )}
        </div>
      </div>

      {/* Label — hidden when sidebar is collapsed */}
      {!collapsed && (
        <div className="flex flex-col items-start min-w-0">
          <span
            className="text-xs font-black leading-tight"
            style={{
              color: isDark ? "#e8e8f0" : "#1a1a2e",
              fontFamily: "Syne, sans-serif",
            }}
          >
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
          <span
            className="text-[10px] leading-tight"
            style={{
              color: isDark ? "#6b6b8a" : "#94a3b8",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {isDark ? "Switch to light" : "Switch to dark"}
          </span>
        </div>
      )}
    </button>
  );
}
