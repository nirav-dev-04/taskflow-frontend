import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiUsers, FiCalendar, FiCheckCircle } from "react-icons/fi";

const PROJECTS = [
  {
    id: 1,
    name: "E-Commerce Platform",
    role: "Frontend Developer",
    progress: 85,
    due: "Jul 30, 2025",
    members: 6,
    tasks: { total: 42, done: 36 },
    color: "#6c63ff",
    desc: "Building a full-stack e-commerce solution with React and Node.js",
    status: "Active",
  },
  {
    id: 2,
    name: "API Integration",
    role: "Backend Developer",
    progress: 45,
    due: "Aug 1, 2025",
    members: 4,
    tasks: { total: 19, done: 9 },
    color: "#00d4aa",
    desc: "Integrating third-party payment and shipping APIs",
    status: "Active",
  },
  {
    id: 3,
    name: "Mobile App Redesign",
    role: "UI Designer",
    progress: 62,
    due: "Aug 15, 2025",
    members: 5,
    tasks: { total: 28, done: 17 },
    color: "#a78bfa",
    desc: "Redesigning the mobile app with a modern and clean UI",
    status: "Active",
  },
];

const EmployeeProjects = () => {
  const { isDark } = useTheme();
  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  return (
    <PageWrapper title="My Projects">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECTS.map((project, i) => (
          <div
            key={project.id}
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.06)",
              animation: `slideUp 0.4s ease ${i * 0.1}s both`,
            }}
          >
            {/* Top */}
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${project.color}, ${project.color}aa)`,
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {project.name[0]}
              </div>
              <span
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{
                  backgroundColor: "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {project.status}
              </span>
            </div>

            {/* Info */}
            <h3
              className="text-base font-bold mb-1"
              style={{ color: text, fontFamily: "Syne, sans-serif" }}
            >
              {project.name}
            </h3>
            <p
              className="text-xs mb-1"
              style={{
                color: project.color,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
              }}
            >
              {project.role}
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {project.desc}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  Progress
                </span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: project.color,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {project.progress}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${project.color}20` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${project.progress}%`,
                    background: `linear-gradient(90deg, ${project.color}, ${project.color}aa)`,
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-1">
                <FiUsers size={13} style={{ color: muted }} />
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {project.members} members
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiCheckCircle size={13} style={{ color: project.color }} />
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {project.tasks.done}/{project.tasks.total} tasks
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar size={13} style={{ color: muted }} />
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {project.due}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default EmployeeProjects;
