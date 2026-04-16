import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FiEdit2, FiMail, FiUser, FiSave, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const Profile = () => {
  const { isDark } = useTheme();
  const { user, updateUser } = useAuth(); // ✅ use updateUser not setUser
  const [editing, setEditing]                 = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [form, setForm]                       = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    bio:   user?.bio   || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    try {
      setSaving(true);

      // ✅ Save to backend (PUT /auth/profile saves to MongoDB)
      const res = await api.put("/auth/profile", {
        name:  form.name,
        email: form.email,
        bio:   form.bio,
      });

      // Backend returns updated user — merge with existing user object
      const updatedUser = { ...user, ...(res.user || res), name: form.name, email: form.email, bio: form.bio };

      // ✅ updateUser updates BOTH React state AND localStorage
      // So on refresh the data stays, AND on next login the DB has latest data
      updateUser(updatedUser);

      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) { toast.error("All fields required"); return; }
    if (passwords.newPassword !== passwords.confirmPassword)  { toast.error("Passwords don't match"); return; }
    if (passwords.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setChangingPassword(false);
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { admin: "#ff6b35", manager: "#00d4aa", employee: "#a78bfa" };
  const roleColor  = roleColors[user?.role] || "#a78bfa";

  return (
    <PageWrapper title="My Profile">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Profile Card */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-16 h-16 rounded-2xl"
                  style={{ border: `3px solid ${roleColor}` }} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#22c55e", border: `2px solid ${cardBg}` }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                {/* ✅ Show live user name from AuthContext */}
                <h2 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>{user?.name}</h2>
                <p className="text-sm capitalize" style={{ color: roleColor, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{user?.role}</p>
                <p className="text-xs mt-0.5" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{user?.email}</p>
                {user?.bio && <p className="text-xs mt-0.5 italic" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{user.bio}</p>}
              </div>
            </div>
            <button
              onClick={() => { setEditing(!editing); setChangingPassword(false); if (!editing) setForm({ name: user?.name || "", email: user?.email || "", bio: user?.bio || "" }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30`, fontFamily: "DM Sans, sans-serif" }}>
              <FiEdit2 size={14} /> {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name",  icon: FiUser, type: "text"  },
              { label: "Email",     key: "email", icon: FiMail, type: "email" },
            ].map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: muted }} />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                    style={{ backgroundColor: editing ? inputBg : "transparent", border: `1px solid ${editing ? roleColor : border}`, color: text, fontFamily: "DM Sans, sans-serif", cursor: editing ? "text" : "default" }} />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                disabled={!editing}
                rows={3}
                placeholder={editing ? "Write a short bio..." : "No bio yet"}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all resize-none"
                style={{ backgroundColor: editing ? inputBg : "transparent", border: `1px solid ${editing ? roleColor : border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
            </div>

            {editing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`, color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: `0 4px 20px ${roleColor}40`, opacity: saving ? 0.7 : 1 }}>
                <FiSave size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6c63ff, #8b85ff)" }}>
                <FiLock size={15} color="white" />
              </div>
              <h3 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>Change Password</h3>
            </div>
            <button
              onClick={() => { setChangingPassword(!changingPassword); setEditing(false); }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(108,99,255,0.1)", color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>
              {changingPassword ? "Cancel" : "Change"}
            </button>
          </div>

          {changingPassword && (
            <div className="space-y-3">
              {[
                { label: "Current Password",      key: "currentPassword" },
                { label: "New Password",           key: "newPassword" },
                { label: "Confirm New Password",   key: "confirmPassword" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{label}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: muted }} />
                    <input
                      type="password"
                      value={passwords[key]}
                      onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
                      style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }} />
                  </div>
                </div>
              ))}
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] mt-2"
                style={{ background: "linear-gradient(135deg, #6c63ff, #8b85ff)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 20px rgba(108,99,255,0.4)", opacity: saving ? 0.7 : 1 }}>
                <FiLock size={16} /> {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;