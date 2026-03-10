import { useTheme } from "../../context/ThemeContext";

const SIZE_CONFIG = {
  xs: { bar: "h-1", label: "text-[10px]", radius: "rounded-full" },
  sm: { bar: "h-1.5", label: "text-xs", radius: "rounded-full" },
  md: { bar: "h-2.5", label: "text-xs", radius: "rounded-full" },
  lg: { bar: "h-4", label: "text-sm", radius: "rounded-xl" },
  xl: { bar: "h-6", label: "text-sm", radius: "rounded-xl" },
};

const COLOR_CONFIG = {
  blue: {
    bar: "linear-gradient(90deg,#3b82f6,#6366f1)",
    track: "rgba(59,130,246,0.12)",
  },
  green: {
    bar: "linear-gradient(90deg,#10b981,#34d399)",
    track: "rgba(16,185,129,0.12)",
  },
  purple: {
    bar: "linear-gradient(90deg,#8b5cf6,#ec4899)",
    track: "rgba(139,92,246,0.12)",
  },
  amber: {
    bar: "linear-gradient(90deg,#f59e0b,#fbbf24)",
    track: "rgba(245,158,11,0.12)",
  },
  red: {
    bar: "linear-gradient(90deg,#ef4444,#f97316)",
    track: "rgba(239,68,68,0.12)",
  },
  cyan: {
    bar: "linear-gradient(90deg,#06b6d4,#3b82f6)",
    track: "rgba(6,182,212,0.12)",
  },
};

/** Automatically picks a color based on value */
function getAutoColor(value) {
  if (value >= 80) return COLOR_CONFIG.green;
  if (value >= 50) return COLOR_CONFIG.blue;
  if (value >= 25) return COLOR_CONFIG.amber;
  return COLOR_CONFIG.red;
}

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  valueSuffix = "%",
  size = "md",
  color = "blue",
  auto = false,
  animated = true,
  striped = false,
  className = "",
}) {
  const { isDark } = useTheme();

  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const s = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  const cfg = auto
    ? getAutoColor(pct)
    : COLOR_CONFIG[color] || COLOR_CONFIG.blue;

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span
              className={`font-semibold ${s.label}`}
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              className={`font-black ${s.label} ml-auto`}
              style={{ color: text, fontFamily: "Syne, sans-serif" }}
            >
              {Math.round(pct)}
              {valueSuffix}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={`w-full overflow-hidden ${s.bar} ${s.radius}`}
        style={{ background: cfg.track }}
      >
        {/* Fill */}
        <div
          className={`h-full ${s.radius} ${animated ? "transition-all duration-700 ease-out" : ""}`}
          style={{
            width: `${pct}%`,
            background: striped
              ? `repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(255,255,255,0.15) 6px,rgba(255,255,255,0.15) 12px), ${cfg.bar}`
              : cfg.bar,
          }}
        />
      </div>
    </div>
  );
}

// ── Multi-segment variant ──────────────────────────────────────────────────

/**
 * Stacked / segmented progress bar.
 *
 * segments = [{ label, value, color? }]
 * total    = sum of all values (auto-calculated if omitted)
 */
export function SegmentedProgressBar({
  segments = [],
  total,
  label,
  size = "md",
  className = "",
}) {
  const { isDark } = useTheme();
  const s = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const DEFAULT_SEG_COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  const sum = total || segments.reduce((a, s) => a + (s.value || 0), 0);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span
          className={`block font-semibold mb-1.5 ${s.label}`}
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          {label}
        </span>
      )}

      {/* Track */}
      <div className={`w-full flex overflow-hidden rounded-full ${s.bar}`}>
        {segments.map((seg, i) => {
          const pct = sum > 0 ? (seg.value / sum) * 100 : 0;
          return (
            <div
              key={i}
              title={`${seg.label}: ${seg.value}`}
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background:
                  seg.color ||
                  DEFAULT_SEG_COLORS[i % DEFAULT_SEG_COLORS.length],
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background:
                  seg.color ||
                  DEFAULT_SEG_COLORS[i % DEFAULT_SEG_COLORS.length],
              }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {seg.label}{" "}
              {sum > 0 ? `(${Math.round((seg.value / sum) * 100)}%)` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
