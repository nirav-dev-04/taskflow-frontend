import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  gradient,
  change,
  suffix = "",
}) => {
  const { isDark } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numValue = parseInt(value) || 0;
    let start = 0;
    const duration = 1200;
    const step = numValue / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  const isPositive = change >= 0;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        animation: "slideUp 0.5s ease forwards",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background:
              gradient || `linear-gradient(135deg, ${color}, ${color}aa)`,
          }}
        >
          <Icon size={22} color="white" />
        </div>
        {change !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              backgroundColor: isPositive
                ? "rgba(34,197,94,0.1)"
                : "rgba(239,68,68,0.1)",
              color: isPositive ? "#22c55e" : "#ef4444",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>

      <div>
        <p
          className="text-3xl font-black mb-1"
          style={{ fontFamily: "Syne, sans-serif", color: text }}
        >
          {displayValue}
          {suffix}
        </p>
        <p
          className="text-sm"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {title}
        </p>
      </div>

      {/* Bottom accent bar */}
      <div
        className="mt-4 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: `${color}20` }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: gradient || color,
            width: "60%",
            animation: "expandWidth 1s ease forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          0% { width: 0%; }
          100% { width: 60%; }
        }
      `}</style>
    </div>
  );
};

export default StatsCard;
