import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "E-Commerce Platform",
    manager: "Sara Chen",
    members: 6,
    tasks: { total: 42, done: 36 },
    progress: 85,
    status: "Active",
    due: "Jul 30",
    color: "#6c63ff",
    priority: "High",
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    manager: "Lisa Wang",
    members: 5,
    tasks: { total: 28, done: 17 },
    progress: 62,
    status: "Active",
    due: "Aug 15",
    color: "#00d4aa",
    priority: "Medium",
  },
  {
    id: 3,
    name: "API Integration",
    manager: "Sara Chen",
    members: 4,
    tasks: { total: 19, done: 9 },
    progress: 45,
    status: "Active",
    due: "Aug 1",
    color: "#ff6b35",
    priority: "High",
  },
  {
    id: 4,
    name: "Dashboard Analytics",
    manager: "Lisa Wang",
    members: 3,
    tasks: { total: 35, done: 32 },
    progress: 91,
    status: "Active",
    due: "Jul 25",
    color: "#22c55e",
    priority: "Low",
  },
  {
    id: 5,
    name: "User Auth System",
    manager: "Sara Chen",
    members: 2,
    tasks: { total: 15, done: 15 },
    progress: 100,
    status: "Completed",
    due: "Jul 10",
    color: "#a78bfa",
    priority: "High",
  },
];

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const STATUS_CONFIG = {
  Active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Completed: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  Archived: { color: "#6b6b8a", bg: "rgba(107,107,138,0.1)" },
};

const ProjectManagement = () => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    manager: "",
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

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.manager.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!newProject.name) {
      toast.error("Project name required");
      return;
    }
    const project = {
      id: Date.now(),
      name: newProject.name,
      manager: newProject.manager || "Unassigned",
      members: 1,
      tasks: { total: 0, done: 0 },
      progress: 0,
      status: "Active",
      due: newProject.due || "TBD",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      priority: newProject.priority,
    };
    setProjects([...projects, project]);
    setNewProject({ name: "", manager: "", due: "", priority: "Medium" });
    setShowAdd(false);
    toast.success("Project created!");
  };

  const handleDelete = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Project deleted!");
  };

  return (
    <PageWrapper title="Project Management">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: muted }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              color: text,
              fontFamily: "DM Sans, sans-serif",
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl outline-none text-sm"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            color: text,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {["All", "Active", "Completed", "Archived"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
            color: "white",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
          }}
        >
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            backgroundColor: cardBg,
            border: `1px solid #ff6b3550`,
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
              value={newProject.manager}
              onChange={(e) =>
                setNewProject({ ...newProject, manager: e.target.value })
              }
              placeholder="Manager Name"
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
              placeholder="Due Date"
              className="px-4 py-2.5 rounded-xl outline-none text-sm"
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                color: "white",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Create Project
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "#1e1e30" : "#e2e8f0",
                color: muted,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project, i) => (
          <div
            key={project.id}
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.06)",
              animation: `slideUp 0.4s ease ${i * 0.08}s both`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}, ${project.color}aa)`,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {project.name[0]}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: text, fontFamily: "Syne, sans-serif" }}
                  >
                    {project.name}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    by {project.manager}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
              >
                <FiTrash2 size={13} />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{
                  backgroundColor: STATUS_CONFIG[project.status].bg,
                  color: STATUS_CONFIG[project.status].color,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {project.status}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{
                  backgroundColor: PRIORITY_CONFIG[project.priority].bg,
                  color: PRIORITY_CONFIG[project.priority].color,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {project.priority}
              </span>
            </div>

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
              <button
                onClick={() => handleDelete(project.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default ProjectManagement;
