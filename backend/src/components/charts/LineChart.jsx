import { useTheme } from "../../context/ThemeContext";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const DEFAULT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

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
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <p className="text-sm font-bold" style={{ color: text }}>
            {entry.name}: {entry.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LineChart({
  data = [],
  lines = [{ key: "value", label: "Value", color: "#3b82f6" }],
  xKey = "name",
  title,
  subtitle,
  height = 280,
  showGrid = true,
  showLegend = false,
  area = false,
  smooth = true,
  gradient = false,
}) {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridCol = isDark ? "#1e1e30" : "#f1f5f9";

  const ChartComponent = area ? AreaChart : ReLineChart;

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
        <ChartComponent
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          {/* Gradient defs for area chart */}
          {area && gradient && (
            <defs>
              {lines.map((line, i) => {
                const color =
                  line.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                return (
                  <linearGradient
                    key={line.key}
                    id={`grad-${line.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
            </defs>
          )}

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
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: muted,
              }}
            />
          )}

          {lines.map((line, i) => {
            const color =
              line.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            if (area) {
              return (
                <Area
                  key={line.key}
                  type={smooth ? "monotone" : "linear"}
                  dataKey={line.key}
                  name={line.label || line.key}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={gradient ? `url(#grad-${line.key})` : `${color}20`}
                  dot={false}
                  activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                />
              );
            }
            return (
              <Line
                key={line.key}
                type={smooth ? "monotone" : "linear"}
                dataKey={line.key}
                name={line.label || line.key}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
