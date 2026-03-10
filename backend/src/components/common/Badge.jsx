const VARIANTS = {
  default:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  primary:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  danger:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  purple:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

const SIZES = {
  xs: "text-[10px] px-1.5 py-0.5 rounded-md",
  sm: "text-xs px-2 py-0.5 rounded-lg",
  md: "text-xs px-2.5 py-1 rounded-lg",
  lg: "text-sm px-3 py-1 rounded-xl",
};

const DOT_SIZES = {
  xs: "w-1.5 h-1.5",
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2 h-2",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  icon: Icon,
  pill = false,
  border = false,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold
        ${VARIANTS[variant] || VARIANTS.default}
        ${SIZES[size] || SIZES.sm}
        ${pill ? "rounded-full" : ""}
        ${border ? "border" : "border-0"}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`rounded-full shrink-0 ${DOT_SIZES[size] || DOT_SIZES.sm} ${getDotColor(variant)}`}
        />
      )}
      {Icon && <Icon size={size === "lg" ? 13 : 11} className="shrink-0" />}
      {children}
    </span>
  );
}

function getDotColor(variant) {
  const map = {
    default: "bg-slate-500",
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-cyan-500",
    purple: "bg-violet-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
  };
  return map[variant] || "bg-slate-500";
}
