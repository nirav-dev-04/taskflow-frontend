import { useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useNotificationContext } from "../../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const { isDark } = useTheme();
  const { unreadCount, isOpen, togglePanel, closePanel } =
    useNotificationContext();
  const bellRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) closePanel();
    }
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, closePanel]);

  const iconColor = isDark ? "#e8e8f0" : "#1a1a2e";
  const hoverBg = isDark ? "#1e1e30" : "#f1f5f9";

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={togglePanel}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{ background: isOpen ? hoverBg : "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = isOpen ? hoverBg : "transparent")
        }
        title="Notifications"
      >
        <FiBell
          size={19}
          style={{
            color: iconColor,
            animation: unreadCount > 0 ? "bellRing 2s ease infinite" : "none",
          }}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black text-white px-1"
            style={{
              background: "linear-gradient(135deg,#ef4444,#f97316)",
              fontFamily: "Syne, sans-serif",
              boxShadow: "0 2px 6px rgba(239,68,68,0.5)",
              animation: "badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 z-50"
          style={{ animation: "dropDown 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <NotificationPanel />
        </div>
      )}

      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          10%      { transform: rotate(14deg); }
          20%      { transform: rotate(-12deg); }
          30%      { transform: rotate(10deg); }
          40%      { transform: rotate(-8deg); }
          50%      { transform: rotate(6deg); }
          60%      { transform: rotate(-4deg); }
          70%      { transform: rotate(2deg); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes dropDown {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)  scale(1);    }
        }
      `}</style>
    </div>
  );
}
