import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const bg = isDark ? "#0a0a0f" : "#f0f2f5";
  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent to your email!");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bg, transition: "all 0.3s ease" }}
    >
      <div
        className="w-full max-w-md"
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
            {sent ? "Check Your Email" : "Forgot Password"}
          </h1>
          <p style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email to reset your password"}
          </p>
        </div>

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
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    style={{ color: muted }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${border}`,
                      color: text,
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
                  color: "white",
                  fontFamily: "DM Sans, sans-serif",
                  boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #4ade80)",
                }}
              >
                <FiMail size={28} color="white" />
              </div>
              <p style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
                Didn't receive it? Check your spam folder or try again.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}
          >
            <FiArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
