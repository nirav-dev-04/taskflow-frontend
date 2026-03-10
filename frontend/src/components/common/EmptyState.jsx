import {
  FiInbox,
  FiSearch,
  FiAlertCircle,
  FiWifi,
  FiLock,
  FiPlus,
} from "react-icons/fi";

const PRESETS = {
  empty: {
    icon: FiInbox,
    title: "Nothing here yet",
    description: "Get started by adding your first item.",
  },
  search: {
    icon: FiSearch,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  error: {
    icon: FiAlertCircle,
    title: "Something went wrong",
    description: "We encountered an error. Please try again.",
  },
  offline: {
    icon: FiWifi,
    title: "You're offline",
    description: "Check your connection and refresh.",
  },
  forbidden: {
    icon: FiLock,
    title: "Access denied",
    description: "You don't have permission to view this.",
  },
};

const SIZES = {
  sm: {
    container: "py-8",
    icon: "w-10 h-10",
    iconSize: 20,
    title: "text-sm",
    desc: "text-xs",
  },
  md: {
    container: "py-12",
    icon: "w-14 h-14",
    iconSize: 26,
    title: "text-base",
    desc: "text-sm",
  },
  lg: {
    container: "py-16",
    icon: "w-20 h-20",
    iconSize: 34,
    title: "text-lg",
    desc: "text-sm",
  },
};

export default function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  actionIcon: ActionIcon = FiPlus,
  secondaryAction,
  secondaryLabel,
  size = "md",
  className = "",
}) {
  const presetData = PRESETS[preset] || {};
  const Icon = CustomIcon || presetData.icon || FiInbox;
  const finalTitle = title || presetData.title || "No data";
  const finalDesc = description || presetData.description;
  const s = SIZES[size] || SIZES.md;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${s.container} ${className}`}
    >
      {/* Icon */}
      <div
        className={`${s.icon} rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4`}
      >
        <Icon
          size={s.iconSize}
          className="text-slate-400 dark:text-slate-500"
        />
      </div>

      {/* Text */}
      <h3
        className={`font-bold text-slate-700 dark:text-slate-300 mb-1.5 ${s.title}`}
      >
        {finalTitle}
      </h3>
      {finalDesc && (
        <p
          className={`text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed ${s.desc}`}
        >
          {finalDesc}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {action && (
            <button
              onClick={action}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {ActionIcon && <ActionIcon size={15} />}
              {actionLabel || "Add Item"}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
            >
              {secondaryLabel || "Learn more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
