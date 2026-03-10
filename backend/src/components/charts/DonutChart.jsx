import { useTheme } from "../../context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const bg = isDark ? "#1e1e30" : "#ffffff";
  const border = isDark ? "#2a2a40" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const item = payload[0];

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <p className="text-xs font-semibold mb-0.5" style={{ color: muted }}>
        {item.name}
      </p>
      <p
        className="text-sm font-black"
        style={{ color: item.payload.fill || text }}
      >
        {item.value}
        {item.payload.percent !== undefined
          ? ` (${(item.payload.percent * 100).toFixed(1)}%)`
          : ""}
      </p>
    </div>
  );
}

function CustomLegend({ payload, isDark }) {
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DonutChart({
  data = [],
  colors,
  title,
  subtitle,
  centerLabel,
  centerValue,
  height = 260,
  innerRadius = 60,
  outerRadius = 95,
  showLegend = true,
}) {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  const chartColors = colors || DEFAULT_COLORS;
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3
              className="font-black text-base"
              style={{ color: text, fontFamily: "Syne, sans-serif" }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color || chartColors[i % chartColors.length]}
                  opacity={0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            {showLegend && (
              <Legend content={<CustomLegend isDark={isDark} />} />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {(centerLabel || centerValue !== undefined) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ top: showLegend ? "-16px" : "0" }}
          >
            {centerValue !== undefined && (
              <span
                className="text-2xl font-black leading-none"
                style={{ color: text, fontFamily: "Syne, sans-serif" }}
              >
                {centerValue ?? total}
              </span>
            )}
            {centerLabel && (
              <span
                className="text-xs mt-0.5"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
