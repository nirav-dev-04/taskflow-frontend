import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

const PageWrapper = ({ children, title }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{
            backgroundColor: isDark ? "#0a0a0f" : "#f0f2f5",
            animation: "fadeIn 0.4s ease forwards",
          }}
        >
          {children}
        </main>
      </div>
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PageWrapper;
