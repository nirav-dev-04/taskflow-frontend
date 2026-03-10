import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiEdit2, FiMail, FiUser, FiSave, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const Profile = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Passionate frontend developer who loves building beautiful UIs.",
    phone: "+1 234 567 8900",
  });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const stats = [
    { label: "Tasks Done", value: "48", color: "#22c55e" },
    { label: "In Progress", value: "3", color: "#6c63ff" },
    { label: "Projects", value: "3", color: "#a78bfa" },
    { label: "Score", value: "92%", color: "#00d4aa" },
  ];

  return (
    <PageWrapper title="My Profile">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Profile Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.3)"
              : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                  }
                  alt={user?.name}
                  className="w-16 h-16 rounded-2xl"
                  style={{ border: "3px solid #a78bfa" }}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "#22c55e",
                    border: `2px solid ${cardBg}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "Syne, sans-serif", color: text }}
                >
                  {user?.name}
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: "#a78bfa",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Employee
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(167,139,250,0.1)",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.3)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <FiEdit2 size={14} />
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-3 rounded-xl"
                style={{
                  backgroundColor: `${stat.color}10`,
                  border: `1px solid ${stat.color}20`,
                }}
              >
                <p
                  className="text-xl font-black"
                  style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name", icon: FiUser },
              { label: "Email", key: "email", icon: FiMail },
              { label: "Phone", key: "phone", icon: FiUser },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key}>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                >
                  {label}
                </label>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={15}
                    style={{ color: muted }}
                  />
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                    style={{
                      backgroundColor: editing ? inputBg : "transparent",
                      border: `1px solid ${editing ? "#a78bfa" : border}`,
                      color: text,
                      fontFamily: "DM Sans, sans-serif",
                      cursor: editing ? "text" : "default",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Bio */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
              >
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all resize-none"
                style={{
                  backgroundColor: editing ? inputBg : "transparent",
                  border: `1px solid ${editing ? "#a78bfa" : border}`,
                  color: text,
                  fontFamily: "DM Sans, sans-serif",
                }}
              />
            </div>

            {editing && (
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
                  color: "white",
                  fontFamily: "DM Sans, sans-serif",
                  boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
                }}
              >
                <FiSave size={16} />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
