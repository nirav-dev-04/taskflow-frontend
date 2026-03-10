import { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  validateProfileForm,
  validateChangePasswordForm,
} from "../../utils/validators";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiSave,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

function Field({ label, error, children }) {
  const { isDark } = useTheme();
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  return (
    <div>
      <label
        className="block text-xs font-bold mb-1.5"
        style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          className="text-xs mt-1"
          style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function InputBase({ icon: Icon, error, isDark, ...props }) {
  const border = error ? "#ef4444" : isDark ? "#2a2a40" : "#e2e8f0";
  const bg = isDark ? "#1a1a2e" : "#f8fafc";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#94a3b8";
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: muted }}
        />
      )}
      <input
        className="w-full rounded-xl py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          paddingLeft: Icon ? "2.5rem" : "0.875rem",
          paddingRight: "0.875rem",
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color: text,
          fontFamily: "DM Sans, sans-serif",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
        onBlur={(e) => (e.target.style.borderColor = border)}
        {...props}
      />
    </div>
  );
}

const AVATAR_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];
function getAvatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export default function ProfileForm({
  user,
  onSave,
  onPasswordChange,
  isLoading,
}) {
  const { isDark } = useTheme();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    avatar: user?.avatar || null,
  });
  const [profileErrors, setProfileErrors] = useState({});

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [activeTab, setActiveTab] = useState("profile");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const subtle = isDark ? "#1a1a2e" : "#f8fafc";
  const tabBg = isDark ? "#1e1e30" : "#f1f5f9";

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, avatar: url, avatarFile: file }));
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const errs = validateProfileForm(profile);
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;
    onSave?.(profile);
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    const errs = validateChangePasswordForm(passwords);
    setPassErrors(errs);
    if (Object.keys(errs).length) return;
    onPasswordChange?.(passwords);
  }

  const TABS = [
    { id: "profile", label: "Profile Info" },
    { id: "password", label: "Change Password" },
  ];

  function PwdInput({ field, label, icon: Icon }) {
    return (
      <Field label={label} error={passErrors[field]}>
        <div className="relative">
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          />
          <input
            type={showPwd[field] ? "text" : "password"}
            value={passwords[field]}
            onChange={(e) => {
              setPasswords((p) => ({ ...p, [field]: e.target.value }));
              setPassErrors((er) => ({ ...er, [field]: "" }));
            }}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full rounded-xl py-2.5 text-sm outline-none transition-all duration-200"
            style={{
              paddingLeft: "2.5rem",
              paddingRight: "2.75rem",
              backgroundColor: subtle,
              border: `1px solid ${passErrors[field] ? "#ef4444" : border}`,
              color: text,
              fontFamily: "DM Sans, sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = passErrors[field]
                ? "#ef4444"
                : border)
            }
          />
          <button
            type="button"
            onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: muted }}
          >
            {showPwd[field] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
      </Field>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Tabs */}
      <div
        className="flex p-2 gap-1"
        style={{ borderBottom: `1px solid ${border}`, backgroundColor: tabBg }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              fontFamily: "DM Sans, sans-serif",
              backgroundColor: activeTab === tab.id ? cardBg : "transparent",
              color: activeTab === tab.id ? text : muted,
              boxShadow:
                activeTab === tab.id
                  ? isDark
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white overflow-hidden"
                  style={{
                    background: profile.avatar
                      ? "transparent"
                      : getAvatarColor(profile.name),
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: "#3b82f6",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
                  }}
                >
                  <FiCamera size={13} color="white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p
                  className="font-black text-base"
                  style={{ color: text, fontFamily: "Syne, sans-serif" }}
                >
                  {profile.name || "Your Name"}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  Click the camera icon to update your photo
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  JPG, PNG or WebP · Max 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name *" error={profileErrors.name}>
                <InputBase
                  icon={FiUser}
                  value={profile.name}
                  error={profileErrors.name}
                  isDark={isDark}
                  placeholder="John Doe"
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, name: e.target.value }));
                    setProfileErrors((er) => ({ ...er, name: "" }));
                  }}
                />
              </Field>
              <Field label="Email Address *" error={profileErrors.email}>
                <InputBase
                  icon={FiMail}
                  value={profile.email}
                  error={profileErrors.email}
                  isDark={isDark}
                  type="email"
                  placeholder="john@example.com"
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, email: e.target.value }));
                    setProfileErrors((er) => ({ ...er, email: "" }));
                  }}
                />
              </Field>
              <Field label="Phone Number" error={profileErrors.phone}>
                <InputBase
                  icon={FiPhone}
                  value={profile.phone}
                  isDark={isDark}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </Field>
              <Field label="Location" error={profileErrors.location}>
                <InputBase
                  icon={FiMapPin}
                  value={profile.location}
                  isDark={isDark}
                  placeholder="City, Country"
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </Field>
            </div>

            <Field label="Bio">
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell your team a bit about yourself..."
                rows={3}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition-all duration-200"
                style={{
                  backgroundColor: subtle,
                  border: `1px solid ${border}`,
                  color: text,
                  fontFamily: "DM Sans, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </Field>

            <div className="flex justify-end pt-1">
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
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* ── Password Tab ── */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-2"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <FiLock size={16} color="#3b82f6" className="mt-0.5 shrink-0" />
              <p
                className="text-xs leading-relaxed"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                Choose a strong password with at least 8 characters, including
                uppercase, lowercase, and a number.
              </p>
            </div>

            <PwdInput
              field="currentPassword"
              label="Current Password"
              icon={FiLock}
            />
            <PwdInput field="newPassword" label="New Password" icon={FiLock} />
            <PwdInput
              field="confirmPassword"
              label="Confirm New Password"
              icon={FiLock}
            />

            <div className="flex justify-end pt-1">
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
                <FiLock size={15} />
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
