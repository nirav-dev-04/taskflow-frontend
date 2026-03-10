import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";

function App() {
  const { loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) return <Loader />;

  return (
    <div className={isDark ? "dark" : "light"}>
      <div
        className="min-h-screen transition-all duration-300"
        style={{
          backgroundColor: isDark ? "#0a0a0f" : "#f0f2f5",
          color: isDark ? "#e8e8f0" : "#1a1a2e",
        }}
      >
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
