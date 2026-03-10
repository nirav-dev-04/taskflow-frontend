import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { MdTask, MdCheckCircle, MdPending, MdTrendingUp } from "react-icons/md";
import { FiClock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const myTasks = [
  {
    id: 1,
    title: "Design Login Page",
    project: "E-Commerce",
    priority: "High",
    status: "In Progress",
    due: "Today",
    color: "#ff6b35",
  },
  {
    id: 2,
    title: "Write API Docs",
    project: "API Integration",
    priority: "Medium",
    status: "Todo",
    due: "Tomorrow",
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Fix Navbar Bug",
    project: "Mobile App",
    priority: "High",
    status: "In Progress",
    due: "Today",
    color: "#ef4444",
  },
  {
    id: 4,
    title: "Unit Tests",
    project: "E-Commerce",
    priority: "Low",
    status: "Todo",
    due: "Aug 1",
    color: "#22c55e",
  },
  {
    id: 5,
    title: "Code Review",
    project: "API Integration",
    priority: "Medium",
    status: "Review",
    due: "Jul 28",
    color: "#a78bfa",
  },
];

const activityData = [
  { day: "Mon", tasks: 3 },
  { day: "Tue", tasks: 5 },
  { day: "Wed", tasks: 2 },
  { day: "Thu", tasks: 7 },
  { day: "Fri", tasks: 4 },
  { day: "Sat", tasks: 1 },
  { day: "Sun", tasks: 0 },
];

const myProjects = [
  {
    name: "E-Commerce Platform",
    role: "Frontend Dev",
    progress: 85,
    color: "#6c63ff",
  },
  {
    name: "API Integration",
    role: "Backend Dev",
    progress: 45,
    color: "#00d4aa",
  },
  {
    name: "Mobile App Redesign",
    role: "UI Designer",
    progress: 62,
    color: "#a78bfa",
  },
];

const STATUS_CONFIG = {
  "In Progress": { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  Todo: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Review: { color: "#00d4aa", bg: "rgba(0,212,170,0.1)" },
  Done: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const EmployeeDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {label}: {payload[0].value} tasks
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper title="My Dashboard">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
          boxShadow: "0 8px 32px rgba(167,139,250,0.3)",
        }}
      >
        <div className="relative z-10">
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Welcome, {user?.name?.split(" ")[0]}! ✨
          </h2>
          <p
            className="text-sm"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            You have 3 tasks due today. Let's get them done!
          </p>
        </div>
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: "white" }}
        />
        <div
          className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="My Tasks"
          value={12}
          icon={MdTask}
          color="#a78bfa"
          gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)"
          change={2}
        />
        <StatsCard
          title="Completed"
          value={8}
          icon={MdCheckCircle}
          color="#22c55e"
          gradient="linear-gradient(135deg, #22c55e, #4ade80)"
          change={15}
        />
        <StatsCard
          title="In Progress"
          value={3}
          icon={MdPending}
          color="#6c63ff"
          gradient="linear-gradient(135deg, #6c63ff, #8b85ff)"
          change={0}
        />
        <StatsCard
          title="My Score"
          value={92}
          icon={MdTrendingUp}
          color="#00d4aa"
          gradient="linear-gradient(135deg, #00d4aa, #00f5c8)"
          change={8}
          suffix="%"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks List */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.3)"
              : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              My Tasks
            </h3>
            <span
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{
                backgroundColor: "rgba(167,139,250,0.1)",
                color: "#a78bfa",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {myTasks.length} tasks
            </span>
          </div>
          <div className="space-y-3">
            {myTasks.map((task, i) => (
              <div
                key={task.id}
                className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: isDark ? "#0d0d18" : "#f8fafc",
                  border: `1px solid ${border}`,
                  animation: `slideUp 0.3s ease ${i * 0.08}s both`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {task.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {task.project}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                <div className="flex items-center gap-1 mt-2">
                  <FiClock
                    size={11}
                    style={{ color: task.due === "Today" ? "#ef4444" : muted }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: task.due === "Today" ? "#ef4444" : muted,
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Due: {task.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Activity Chart */}
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
            <h3
              className="text-base font-bold mb-4"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              Weekly Activity
            </h3>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={activityData}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: muted, fontSize: 10, fontFamily: "DM Sans" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ fill: "#a78bfa", r: 3 }}
                  name="Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* My Projects */}
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
            <h3
              className="text-base font-bold mb-4"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              My Projects
            </h3>
            <div className="space-y-4">
              {myProjects.map((project, i) => (
                <div
                  key={project.name}
                  style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: text,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {project.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: muted,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {project.role}
                      </p>
                    </div>
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
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Status */}
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
            <h3
              className="text-base font-bold mb-3"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              Task Summary
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Completed",
                  count: 8,
                  icon: FiCheckCircle,
                  color: "#22c55e",
                },
                {
                  label: "In Progress",
                  count: 3,
                  icon: FiClock,
                  color: "#6c63ff",
                },
                {
                  label: "Overdue",
                  count: 1,
                  icon: FiAlertCircle,
                  color: "#ef4444",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-xl"
                  style={{ backgroundColor: `${item.color}10` }}
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={15} style={{ color: item.color }} />
                    <span
                      className="text-sm"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: item.color,
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
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

export default EmployeeDashboard;
