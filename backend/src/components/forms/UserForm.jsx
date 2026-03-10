import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../../utils/validators";
import {
  FiUser,
  FiMail,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
} from "react-icons/fi";

const ROLES = [
  {
    value: "employee",
    label: "Employee",
    desc: "Can view & manage assigned tasks",
    color: "#64748b",
    bg: "rgba(100,116,139,0.10)",
  },
  {
    value: "manager",
    label: "Manager",
    desc: "Can manage projects, tasks & team",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Full access to all platform features",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
  },
];

const DEFAULT_FORM = {
  name: "",
  email: "",
  role: "employee",
  password: "",
  confirmPassword: "",
  isActive: true,
};

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const { isDark } = useTheme();
  const isEdit = !!initialData;

  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "employee",
        isActive: initialData.isActive ?? true,
        password: "",
        confirmPassword: "",
      });
    }
  }, [initialData]);

  function validate() {
    const errs = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (!isEdit) {
      const passErr = validatePassword(form.password);
      if (passErr) errs.password = passErr;
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    } else if (form.password) {
      const passErr = validatePassword(form.password);
      if (passErr) errs.password = passErr;
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      isActive: form.isActive,
    };
    if (form.password) payload.password = form.password;
    onSubmit?.(payload);
  }

  const inputStyle = (field) => ({
    width: "100%",
    borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem",
    backgroundColor: subtle,
    border: `1px solid ${errors[field] ? "#ef4444" : border}`,
    color: text,
    fontSize: "0.875rem",
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
  });

  function Label({ children }) {
    return (
      <label
        className="block text-xs font-bold mb-1.5"
        style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
      >
        {children}
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <div className="relative">
            <FiUser
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted }}
            />
            <input
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: "" }));
              }}
              placeholder="John Doe"
              style={{ ...inputStyle("name"), paddingLeft: "2.5rem" }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.name ? "#ef4444" : border)
              }
            />
          </div>
          {errors.name && (
            <p
              className="text-xs mt-1"
              style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
            >
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <Label>Email Address *</Label>
          <div className="relative">
            <FiMail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted }}
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                setErrors((er) => ({ ...er, email: "" }));
              }}
              placeholder="john@company.com"
              style={{ ...inputStyle("email"), paddingLeft: "2.5rem" }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.email ? "#ef4444" : border)
              }
            />
          </div>
          {errors.email && (
            <p
              className="text-xs mt-1"
              style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
            >
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Role */}
      <div>
        <Label>Role *</Label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: role.value }))}
              className="flex flex-col items-start p-3 rounded-xl text-left transition-all duration-150"
              style={{
                background: form.role === role.value ? role.bg : subtle,
                border: `1px solid ${form.role === role.value ? role.color : border}`,
                boxShadow:
                  form.role === role.value
                    ? `0 2px 8px ${role.color}30`
                    : "none",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <FiShield
                  size={12}
                  style={{
                    color: form.role === role.value ? role.color : muted,
                  }}
                />
                <span
                  className="text-xs font-black"
                  style={{
                    color: form.role === role.value ? role.color : text,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {role.label}
                </span>
              </div>
              <p
                className="text-[10px] leading-tight"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                {role.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Password */}
      <div>
        <Label>
          {isEdit ? "New Password (leave blank to keep current)" : "Password *"}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}
              />
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  setErrors((er) => ({ ...er, password: "" }));
                }}
                placeholder={isEdit ? "New password..." : "Min. 8 characters"}
                style={{
                  ...inputStyle("password"),
                  paddingLeft: "2.5rem",
                  paddingRight: "2.75rem",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.password
                    ? "#ef4444"
                    : border)
                }
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}
              >
                {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p
                className="text-xs mt-1"
                style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
              >
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}
              />
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }));
                  setErrors((er) => ({ ...er, confirmPassword: "" }));
                }}
                placeholder="Confirm password"
                style={{
                  ...inputStyle("confirmPassword"),
                  paddingLeft: "2.5rem",
                  paddingRight: "2.75rem",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.confirmPassword
                    ? "#ef4444"
                    : border)
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}
              >
                {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                className="text-xs mt-1"
                style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: subtle, border: `1px solid ${border}` }}
      >
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            Account Status
          </p>
          <p
            className="text-xs"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            {form.isActive
              ? "User can log in and access the platform"
              : "User account is deactivated"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
          className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
          style={{
            background: form.isActive
              ? "#10b981"
              : isDark
                ? "#2a2a40"
                : "#e2e8f0",
          }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
            style={{
              left: form.isActive ? "calc(100% - 1.375rem)" : "0.125rem",
            }}
          />
        </button>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-end gap-3 pt-2"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              color: muted,
              background: subtle,
              border: `1px solid ${border}`,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
          }}
        >
          <FiSave size={15} />
          {isLoading ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}
