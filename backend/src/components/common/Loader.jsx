const Loader = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div
          className="text-3xl font-bold"
          style={{
            fontFamily: "Syne, sans-serif",
            background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TaskFlow
        </div>

        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#6c63ff",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#a78bfa",
              animation: "spin 0.7s linear infinite reverse",
            }}
          />
        </div>

        <p
          style={{
            color: "#6b6b8a",
            fontSize: "14px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Loading...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
