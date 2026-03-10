import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) navigate("/login");
    else if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "manager") navigate("/manager/dashboard");
    else navigate("/employee/dashboard");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div
        className="text-center"
        style={{ animation: "slideUp 0.5s ease forwards" }}
      >
        <div
          className="text-9xl font-black mb-4"
          style={{
            fontFamily: "Syne, sans-serif",
            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          403
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "#e8e8f0", fontFamily: "Syne, sans-serif" }}
        >
          Access Denied
        </h2>
        <p className="mb-8" style={{ color: "#6b6b8a" }}>
          You don't have permission to access this page.
        </p>
        <button
          onClick={goHome}
          className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
            color: "white",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Go Home
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;
