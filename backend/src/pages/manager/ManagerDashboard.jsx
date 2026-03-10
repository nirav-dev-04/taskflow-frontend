import PageWrapper from "../../components/layout/PageWrapper";
import StatsCard from "../../components/cards/StatsCard";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MdFolder, MdTask, MdPeople, MdTrendingUp } from "react-icons/md";
import { FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const sprintData = [
  { sprint: "S1", done: 20, todo: 5 },
  { sprint: "S2", done: 28, todo: 8 },
  { sprint: "S3", done: 35, todo: 3 },
  { sprint: "S4", done: 18, todo: 12 },
  { sprint: "S5", done: 40, todo: 2 },
];

const teamMembers = [
  {
    name: "John Smith",
    tasks: 8,
    done: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    status: "online",
  },
  {
    name: "Amy Lee",
    tasks: 6,
    done: 6,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
    status: "online",
  },
  {
    name: "Mike Davis",
    tasks: 10,
    done: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    status: "offline",
  },
  {
    name: "Lisa Wang",
    tasks: 7,
    done: 7,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "online",
  },
];

const myProjects = [
  {
    name: "E-Commerce Platform",
    progress: 85,
    due: "Jul 30",
    priority: "High",
    color: "#6c63ff",
  },
  {
    name: "Mobile App Redesign",
    progress: 62,
    due: "Aug 15",
    priority: "Medium",
    color: "#00d4aa",
  },
  {
    name: "API Integration",
    progress: 45,
    due: "Aug 1",
    priority: "High",
    color: "#ff6b35",
  },
];

const pendingReviews = [
  {
    task: "Login UI Component",
    assignee: "John Smith",
    priority: "High",
    color: "#ef4444",
  },
  {
    task: "API Endpoint Testing",
    assignee: "Amy Lee",
    priority: "Medium",
    color: "#f59e0b",
  },
  {
    task: "Database Schema",
    assignee: "Mike Davis",
    priority: "Low",
    color: "#22c55e",
  },
];

const ManagerDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const gridBg = isDark ? "#1e1e30" : "#f1f5f9";

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {label}
          </p>
          {payload.map((p, i) => (
            <p
              key={i}
              className="text-xs"
              style={{ color: p.color, fontFamily: "DM Sans, sans-serif" }}
            >
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper title="Manager Dashboard">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #00d4aa, #00f5c8)",
          boxShadow: "0 8px 32px rgba(0,212,170,0.3)",
        }}
      >
        <div className="relative z-10">
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Hey {user?.name?.split(" ")[0]}! 🚀
          </h2>
          <p
            className="text-sm"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Your team has completed 68% of this sprint. Keep pushing!
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
          title="My Projects"
          value={3}
          icon={MdFolder}
          color="#00d4aa"
          gradient="linear-gradient(135deg, #00d4aa, #00f5c8)"
          change={0}
        />
        <StatsCard
          title="Team Members"
          value={4}
          icon={MdPeople}
          color="#6c63ff"
          gradient="linear-gradient(135deg, #6c63ff, #8b85ff)"
          change={0}
        />
        <StatsCard
          title="Active Tasks"
          value={31}
          icon={MdTask}
          color="#ff6b35"
          gradient="linear-gradient(135deg, #ff6b35, #ff8c5a)"
          change={10}
        />
        <StatsCard
          title="Sprint Progress"
          value={68}
          icon={MdTrendingUp}
          color="#a78bfa"
          gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)"
          change={5}
          suffix="%"
        />
      </div>

      {/* Charts & Team Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Sprint Chart */}
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
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: text }}
          >
            Sprint Performance
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sprintData} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis
                dataKey="sprint"
                tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: muted, fontSize: 12, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="done"
                fill="#00d4aa"
                radius={[4, 4, 0, 0]}
                name="Done"
              />
              <Bar
                dataKey="todo"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Todo"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Workload */}
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
            Team Workload
          </h3>
          <div className="space-y-4">
            {teamMembers.map((member, i) => (
              <div
                key={member.name}
                className="flex items-center gap-3"
                style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full"
                    style={{ border: "2px solid #00d4aa" }}
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor:
                        member.status === "online" ? "#22c55e" : "#6b6b8a",
                      borderColor: cardBg,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {member.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {member.done}/{member.tasks}
                    </p>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#00d4aa20" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(member.done / member.tasks) * 100}%`,
                        backgroundColor: "#00d4aa",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects & Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: isDark ? "#0d0d18" : "#f8fafc",
                  animation: `slideUp 0.3s ease ${i * 0.1}s both`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                  >
                    {project.name}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg font-medium"
                    style={{
                      backgroundColor: `${project.color}20`,
                      color: project.color,
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {project.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
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
                <p
                  className="text-xs mt-1"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  Due: {project.due}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
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
            Pending Reviews
          </h3>
          <div className="space-y-3">
            {pendingReviews.map((item, i) => (
              <div
                key={item.task}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: isDark ? "#0d0d18" : "#f8fafc",
                  animation: `slideUp 0.3s ease ${i * 0.1}s both`,
                }}
              >
                <div className="flex items-center gap-3">
                  <FiClock size={16} style={{ color: item.color }} />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {item.task}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      by {item.assignee}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.1)",
                      color: "#22c55e",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
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

export default ManagerDashboard;
