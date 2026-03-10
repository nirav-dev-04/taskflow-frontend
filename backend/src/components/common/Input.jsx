import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-3.5 py-2.5 text-sm rounded-xl",
  lg: "px-4 py-3 text-base rounded-xl",
};

const ICON_PAD = {
  sm: { left: "pl-8", right: "pr-8" },
  md: { left: "pl-10", right: "pr-10" },
  lg: { left: "pl-11", right: "pr-11" },
};

const ICON_POS = {
  sm: { left: "left-2.5", right: "right-2.5", top: "top-1.5" },
  md: { left: "left-3", right: "right-3", top: "top-2.5" },
  lg: { left: "left-3.5", right: "right-3.5", top: "top-3" },
};

const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      success,
      type = "text",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = true,
      className = "",
      containerClassName = "",
      id,
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const iconSize = size === "lg" ? 17 : 15;
    const pos = ICON_POS[size] || ICON_POS.md;
    const pad = ICON_PAD[size] || ICON_PAD.md;

    const baseInput = `
    w-full bg-slate-50 dark:bg-slate-800 
    text-slate-800 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    border outline-none transition-all duration-150
    ${SIZES[size] || SIZES.md}
  `;

    const stateClasses = error
      ? "border-red-400 dark:border-red-600 focus:border-red-400 dark:focus:border-red-600 focus:ring-2 focus:ring-red-300/30"
      : success
        ? "border-emerald-400 dark:border-emerald-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30"
        : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-300/30";

    const paddingClasses = [
      LeftIcon ? pad.left : "",
      RightIcon || isPassword || error || success ? pad.right : "",
    ].join(" ");

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <LeftIcon
              size={iconSize}
              className={`absolute ${pos.left} ${pos.top} text-slate-400 dark:text-slate-500 pointer-events-none`}
            />
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={`${baseInput} ${stateClasses} ${paddingClasses} ${className}`}
            {...rest}
          />

          {/* Right icons: status OR password toggle OR custom icon */}
          <div
            className={`absolute ${pos.right} ${pos.top} flex items-center gap-1`}
          >
            {error && (
              <FiAlertCircle
                size={iconSize}
                className="text-red-500 dark:text-red-400 shrink-0"
              />
            )}
            {success && !error && (
              <FiCheckCircle
                size={iconSize}
                className="text-emerald-500 shrink-0"
              />
            )}
            {isPassword && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <FiEyeOff size={iconSize} />
                ) : (
                  <FiEye size={iconSize} />
                )}
              </button>
            )}
            {!isPassword && !error && !success && RightIcon && (
              <RightIcon
                size={iconSize}
                className="text-slate-400 dark:text-slate-500 pointer-events-none"
              />
            )}
          </div>
        </div>

        {(error || hint || success) && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? "text-red-500 dark:text-red-400"
                : success
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
