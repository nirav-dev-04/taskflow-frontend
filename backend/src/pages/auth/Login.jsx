import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}! 👋`);
      if (result.user.role === "admin") navigate("/admin/dashboard");
      else if (result.user.role === "manager") navigate("/manager/dashboard");
      else navigate("/employee/dashboard");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const demoLogins = [
    {
      role: "Admin",
      email: "admin@taskflow.com",
      password: "admin123",
      color: "#ff6b35",
    },
    {
      role: "Manager",
      email: "manager@taskflow.com",
      password: "manager123",
      color: "#00d4aa",
    },
    {
      role: "Employee",
      email: "employee@taskflow.com",
      password: "employee123",
      color: "#a78bfa",
    },
  ];

  const bg = isDark ? "#0a0a0f" : "#f0f2f5";
  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: bg, transition: "all 0.3s ease" }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #6c63ff, transparent)",
            top: "-10%",
            left: "-10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #a78bfa, transparent)",
            bottom: "-10%",
            right: "-10%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{
            background: "radial-gradient(circle, #00d4aa, transparent)",
            top: "50%",
            left: "50%",
            animation: "float 7s ease-in-out infinite",
          }}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          color: text,
        }}
      >
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      {/* Main Card */}
      <div
        className="w-full max-w-md relative z-10"
        style={{ animation: "slideUp 0.6s ease forwards" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
              }}
            >
              <MdDashboard size={22} color="white" />
            </div>
            <span
              className="text-2xl font-black"
              style={{
                fontFamily: "Syne, sans-serif",
                background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TaskFlow
            </span>
          </div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "Syne, sans-serif", color: text }}
          >
            Welcome Back
          </h1>
          <p style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            boxShadow: isDark
              ? "0 4px 40px rgba(0,0,0,0.4)"
              : "0 4px 40px rgba(0,0,0,0.08)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={17}
                  style={{
                    color: focusedField === "email" ? "#6c63ff" : muted,
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${focusedField === "email" ? "#6c63ff" : border}`,
                    color: text,
                    fontFamily: "DM Sans, sans-serif",
                    boxShadow:
                      focusedField === "email"
                        ? "0 0 0 3px rgba(108,99,255,0.15)"
                        : "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={17}
                  style={{
                    color: focusedField === "password" ? "#6c63ff" : muted,
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl outline-none transition-all duration-300"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${focusedField === "password" ? "#6c63ff" : border}`,
                    color: text,
                    fontFamily: "DM Sans, sans-serif",
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 3px rgba(108,99,255,0.15)"
                        : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: muted }}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm transition-colors duration-200 hover:underline"
                style={{ color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{
                background: loading
                  ? "#3a3a5c"
                  : "linear-gradient(135deg, #6c63ff, #8b85ff)",
                color: "white",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: loading ? "none" : "0 4px 20px rgba(108,99,255,0.4)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: border }} />
            <span
              className="text-xs"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              Quick Demo Login
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: border }} />
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {demoLogins.map((demo) => (
              <button
                key={demo.role}
                onClick={() => {
                  setEmail(demo.email);
                  setPassword(demo.password);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: `${demo.color}15`,
                  border: `1px solid ${demo.color}40`,
                  color: demo.color,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {demo.role}
              </button>
            ))}
          </div>
        </div>

        {/* Register Link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-200 hover:underline"
            style={{ color: "#6c63ff" }}
          >
            Sign up
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
