import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiClock, FiFilter, FiSearch, FiPlus } from "react-icons/fi";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

const ALL_TASKS = [
  {
    id: 1,
    title: "Design Login Page",
    project: "E-Commerce",
    priority: "High",
    status: "In Progress",
    due: "Today",
    desc: "Create a modern login UI with animations",
  },
  {
    id: 2,
    title: "Write API Docs",
    project: "API Integration",
    priority: "Medium",
    status: "Todo",
    due: "Tomorrow",
    desc: "Document all REST endpoints",
  },
  {
    id: 3,
    title: "Fix Navbar Bug",
    project: "Mobile App",
    priority: "High",
    status: "In Progress",
    due: "Today",
    desc: "Navbar collapses on mobile incorrectly",
  },
  {
    id: 4,
    title: "Unit Tests",
    project: "E-Commerce",
    priority: "Low",
    status: "Todo",
    due: "Aug 1",
    desc: "Write unit tests for auth module",
  },
  {
    id: 5,
    title: "Code Review",
    project: "API Integration",
    priority: "Medium",
    status: "Review",
    due: "Jul 28",
    desc: "Review PR #42 from teammate",
  },
  {
    id: 6,
    title: "Database Schema",
    project: "E-Commerce",
    priority: "High",
    status: "Done",
    due: "Jul 20",
    desc: "Finalize MongoDB schema design",
  },
  {
    id: 7,
    title: "Deploy to Staging",
    project: "Mobile App",
    priority: "Medium",
    status: "Done",
    due: "Jul 22",
    desc: "Deploy latest build to staging server",
  },
];

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const STATUS_CONFIG = {
  "In Progress": { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  Todo: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Review: { color: "#00d4aa", bg: "rgba(0,212,170,0.1)" },
  Done: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const MyTasks = () => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [tasks, setTasks] = useState(ALL_TASKS);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchPriority =
      filterPriority === "All" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const toggleDone = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Done" ? "Todo" : "Done" }
          : t,
      ),
    );
  };

  return (
    <PageWrapper title="My Tasks">
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={15}
              style={{ color: muted }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${border}`,
              color: text,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {["All", "Todo", "In Progress", "Review", "Done"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${border}`,
              color: text,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {["All", "High", "Medium", "Low"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Task Count */}
        <p
          className="text-sm mb-4"
          style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
        >
          Showing{" "}
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>
            {filtered.length}
          </span>{" "}
          tasks
        </p>

        {/* Tasks List */}
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{
                backgroundColor: isDark ? "#0d0d18" : "#f8fafc",
                border: `1px solid ${task.status === "Done" ? "transparent" : border}`,
                animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                opacity: task.status === "Done" ? 0.7 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task.id)}
                className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
              >
                {task.status === "Done" ? (
                  <MdCheckCircle size={20} style={{ color: "#22c55e" }} />
                ) : (
                  <MdRadioButtonUnchecked size={20} style={{ color: muted }} />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: text,
                      fontFamily: "DM Sans, sans-serif",
                      textDecoration:
                        task.status === "Done" ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </p>
                  <div className="flex gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg font-medium"
                      style={{
                        backgroundColor: PRIORITY_CONFIG[task.priority].bg,
                        color: PRIORITY_CONFIG[task.priority].color,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {task.priority}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg font-medium"
                      style={{
                        backgroundColor: STATUS_CONFIG[task.status].bg,
                        color: STATUS_CONFIG[task.status].color,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {task.desc}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(167,139,250,0.1)",
                      color: "#a78bfa",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {task.project}
                  </span>
                  <div className="flex items-center gap-1">
                    <FiClock
                      size={11}
                      style={{
                        color: task.due === "Today" ? "#ef4444" : muted,
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: task.due === "Today" ? "#ef4444" : muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {task.due}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p
                className="text-lg font-semibold"
                style={{ color: muted, fontFamily: "Syne, sans-serif" }}
              >
                No tasks found
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                Try changing your filters
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageWrapper>
  );
};

export default MyTasks;
