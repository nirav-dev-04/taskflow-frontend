import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../services/api";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const bg = isDark ? "#0a0a0f" : "#f0f2f5";
  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Full Name", icon: FiUser, type: "text", placeholder: "Enter your name" },
    { key: "email", label: "Email Address", icon: FiMail, type: "email", placeholder: "Enter your email" },
    { key: "password", label: "Password", icon: FiLock, type: showPassword ? "text" : "password", placeholder: "Create a password" },
    { key: "confirm", label: "Confirm Password", icon: FiLock, type: showPassword ? "text" : "password", placeholder: "Confirm your password" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: bg, transition: "all 0.3s ease" }}>
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #00d4aa, transparent)", top: "-10%", right: "-10%", animation: "float 6s ease-in-out infinite" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #6c63ff, transparent)", bottom: "-10%", left: "-10%", animation: "float 8s ease-in-out infinite reverse" }} />
      </div>

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text }}>
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <div className="w-full max-w-md relative z-10" style={{ animation: "slideUp 0.6s ease forwards" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6c63ff, #a78bfa)" }}>
              <MdDashboard size={22} color="white" />
            </div>
            <span className="text-2xl font-black" style={{ fontFamily: "Syne, sans-serif", background: "linear-gradient(135deg, #6c63ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TaskFlow</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: text }}>Create Account</h1>
          <p style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>Join your team workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 40px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: focusedField === key ? "#6c63ff" : muted }} />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={() => setFocusedField(key)}
                    onBlur={() => setFocusedField("")}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300"
                    style={{ backgroundColor: inputBg, border: `1px solid ${focusedField === key ? "#6c63ff" : border}`, color: text, fontFamily: "DM Sans, sans-serif", boxShadow: focusedField === key ? "0 0 0 3px rgba(108,99,255,0.15)" : "none" }}
                  />
                  {(key === "password" || key === "confirm") && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: muted }}>
                      {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{ background: loading ? "#3a3a5c" : "linear-gradient(135deg, #6c63ff, #8b85ff)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: loading ? "none" : "0 4px 20px rgba(108,99,255,0.4)", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: "spin 0.8s linear infinite" }} />
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: "#6c63ff" }}>Sign in</Link>
        </p>
      </div>

      <style>{`
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Register;