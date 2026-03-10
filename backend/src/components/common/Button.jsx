import { forwardRef } from "react";
import Loader from "./Loader";

const VARIANTS = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md border border-blue-600 hover:border-blue-700",
  secondary:
    "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md border border-red-600 hover:border-red-700",
  ghost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent",
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md border border-emerald-600 hover:border-emerald-700",
  warning:
    "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md border border-amber-500 hover:border-amber-600",
  outline:
    "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-400 dark:border-blue-600",
};

const SIZES = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3.5 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
  xl: "px-6 py-3 text-base rounded-2xl gap-2.5",
};

const ICON_SIZES = { xs: 12, sm: 14, md: 15, lg: 16, xl: 18 };

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      disabled = false,
      fullWidth = false,
      className = "",
      onClick,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = ICON_SIZES[size] || 15;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 active:scale-[0.97]
        focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-1
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
        ${className}
      `}
        {...rest}
      >
        {loading ? (
          <Loader size="sm" color="current" />
        ) : (
          LeftIcon && <LeftIcon size={iconSize} className="shrink-0" />
        )}
        {children && <span>{children}</span>}
        {!loading && RightIcon && (
          <RightIcon size={iconSize} className="shrink-0" />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
