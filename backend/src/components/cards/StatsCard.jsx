import { useTheme } from "../../context/ThemeContext";

const StatsCard = ({ title, value, icon: Icon, color, gradient, change, suffix = "" }) => {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text   = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted  = isDark ? "#6b6b8a" : "#64748b";

  // ✅ Only show change badge if change is non-zero
  const showChange = change !== 0 && change !== undefined && change !== null;
  const isPositive = change > 0;

  return (
    <div className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}>

      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: gradient || color }}>
          <Icon size={22} color="white" />
        </div>

        {/* Change badge — only shows if change != 0 */}
        {showChange && (
          <span className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              backgroundColor: isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: isPositive ? "#22c55e" : "#ef4444",
              fontFamily: "DM Sans, sans-serif",
            }}>
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-black mb-1"
        style={{ color, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
        {value}{suffix}
      </p>

      {/* Title */}
      <p className="text-sm"
        style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
        {title}
      </p>

      {/* Bottom accent bar */}
      <div className="mt-3 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: `${color}20` }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: suffix === "%" ? `${Math.min(value, 100)}%` : "60%",
            background: gradient || color,
          }} />
      </div>
    </div>
  );
};

export default StatsCard;