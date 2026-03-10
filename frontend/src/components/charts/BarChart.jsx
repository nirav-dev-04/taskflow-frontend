import { useTheme } from "../../context/ThemeContext";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const bg = isDark ? "#1e1e30" : "#ffffff";
  const border = isDark ? "#2a2a40" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <p className="text-xs font-semibold mb-1.5" style={{ color: muted }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p
          key={i}
          className="text-sm font-bold"
          style={{ color: entry.color || text }}
        >
          {entry.name}: <span style={{ color: text }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function BarChart({
  data = [],
  bars = [{ key: "value", label: "Value", color: "#3b82f6" }],
  xKey = "name",
  title,
  subtitle,
  height = 280,
  showGrid = true,
  showLegend = false,
  stacked = false,
  colorful = false,
}) {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridCol = isDark ? "#1e1e30" : "#f1f5f9";

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
        <div className="mb-5">
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

      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barCategoryGap="30%"
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridCol}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xKey}
            tick={{
              fill: muted,
              fontSize: 11,
              fontFamily: "DM Sans, sans-serif",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: muted,
              fontSize: 11,
              fontFamily: "DM Sans, sans-serif",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip isDark={isDark} />}
            cursor={{ fill: `${muted}15` }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: muted,
              }}
            />
          )}
          {bars.map((bar, bi) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label || bar.key}
              fill={bar.color || DEFAULT_COLORS[bi % DEFAULT_COLORS.length]}
              radius={[6, 6, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={48}
            >
              {colorful &&
                bars.length === 1 &&
                data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  />
                ))}
            </Bar>
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
