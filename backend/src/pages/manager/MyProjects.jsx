import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import {
  FiUsers,
  FiCalendar,
  FiPlus,
  FiMoreVertical,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "E-Commerce Platform",
    desc: "Full-stack e-commerce with React & Node.js",
    progress: 85,
    due: "Jul 30, 2025",
    members: 6,
    tasks: { total: 42, done: 36 },
    color: "#6c63ff",
    status: "Active",
    priority: "High",
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    desc: "Redesigning mobile app with modern UI",
    progress: 62,
    due: "Aug 15, 2025",
    members: 5,
    tasks: { total: 28, done: 17 },
    color: "#00d4aa",
    status: "Active",
    priority: "Medium",
  },
  {
    id: 3,
    name: "API Integration",
    desc: "Integrating payment and shipping APIs",
    progress: 45,
    due: "Aug 1, 2025",
    members: 4,
    tasks: { total: 19, done: 9 },
    color: "#ff6b35",
    status: "Active",
    priority: "High",
  },
];

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const MyProjects = () => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    desc: "",
    due: "",
    priority: "Medium",
  });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const COLORS = [
    "#6c63ff",
    "#00d4aa",
    "#ff6b35",
    "#a78bfa",
    "#22c55e",
    "#f59e0b",
  ];

  const handleAdd = () => {
    if (!newProject.name) {
      toast.error("Project name required");
      return;
    }
    const project = {
      id: Date.now(),
      name: newProject.name,
      desc: newProject.desc,
      progress: 0,
      due: newProject.due || "TBD",
      members: 1,
      tasks: { total: 0, done: 0 },
      status: "Active",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      priority: newProject.priority,
    };
    setProjects([...projects, project]);
    setNewProject({ name: "", desc: "", due: "", priority: "Medium" });
    setShowAdd(false);
    toast.success("Project created!");
  };

  return (
    <PageWrapper title="My Projects">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p
          className="text-sm"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          Managing{" "}
          <span style={{ color: "#00d4aa", fontWeight: 600 }}>
            {projects.length}
          </span>{" "}
          projects
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00d4aa, #00f5c8)",
            color: "white",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
          }}
        >
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Add Project Form */}
      {showAdd && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            backgroundColor: cardBg,
            border: `1px solid #00d4aa50`,
            boxShadow: "0 4px 24px rgba(0,212,170,0.1)",
            animation: "slideUp 0.3s ease",
          }}
        >
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: text }}
          >
            New Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              placeholder="Project Name *"
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            <input
              value={newProject.due}
              onChange={(e) =>
                setNewProject({ ...newProject, due: e.target.value })
              }
              placeholder="Due Date (e.g. Aug 30, 2025)"
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            <input
              value={newProject.desc}
              onChange={(e) =>
                setNewProject({ ...newProject, desc: e.target.value })
              }
              placeholder="Description"
              className="px-4 py-2.5 rounded-xl outline-none text-sm md:col-span-2"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            <select
              value={newProject.priority}
              onChange={(e) =>
                setNewProject({ ...newProject, priority: e.target.value })
              }
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {["High", "Medium", "Low"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #00d4aa, #00f5c8)",
                color: "white",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Create Project
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, i) => (
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
                  backgroundColor: PRIORITY_CONFIG[project.priority].bg,
                  color: PRIORITY_CONFIG[project.priority].color,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {project.priority}
              </span>
            </div>
            <h3
              className="text-base font-bold mb-1"
              style={{ color: text, fontFamily: "Syne, sans-serif" }}
            >
              {project.name}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {project.desc}
            </p>
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
                  className="h-full rounded-full"
                  style={{
                    width: `${project.progress}%`,
                    background: `linear-gradient(90deg, ${project.color}, ${project.color}aa)`,
                  }}
                />
              </div>
            </div>
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
                  {project.members}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiCheckCircle size={13} style={{ color: project.color }} />
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {project.tasks.done}/{project.tasks.total}
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

export default MyProjects;
