import { useState } from "react";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MdPeople, MdFolder, MdTask, MdTrendingUp } from "react-icons/md";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";

const taskData = [
  { month: "Jan", completed: 40, pending: 15, inProgress: 20 },
  { month: "Feb", completed: 55, pending: 20, inProgress: 25 },
  { month: "Mar", completed: 45, pending: 18, inProgress: 22 },
  { month: "Apr", completed: 70, pending: 10, inProgress: 30 },
  { month: "May", completed: 65, pending: 12, inProgress: 28 },
  { month: "Jun", completed: 80, pending: 8, inProgress: 35 },
  { month: "Jul", completed: 90, pending: 5, inProgress: 40 },
];

const pieData = [
  { name: "Completed", value: 445, color: "#22c55e" },
  { name: "In Progress", value: 200, color: "#6c63ff" },
  { name: "Pending", value: 88, color: "#f59e0b" },
  { name: "Overdue", value: 30, color: "#ef4444" },
];

const lineData = [
  { day: "Mon", users: 20 },
  { day: "Tue", users: 35 },
  { day: "Wed", users: 28 },
  { day: "Thu", users: 45 },
  { day: "Fri", users: 38 },
  { day: "Sat", users: 15 },
  { day: "Sun", users: 10 },
];

const recentActivity = [
  {
    id: 1,
    user: "Sara Chen",
    action: "completed task",
    target: "UI Design Review",
    time: "2m ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    color: "#22c55e",
  },
  {
    id: 2,
    user: "John Smith",
    action: "created project",
    target: "Mobile App v2",
    time: "15m ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    color: "#6c63ff",
  },
  {
    id: 3,
    user: "Amy Lee",
    action: "assigned task",
    target: "Backend API",
    time: "1h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
    color: "#f59e0b",
  },
  {
    id: 4,
    user: "Mike Davis",
    action: "commented on",
    target: "Sprint Planning",
    time: "2h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    color: "#00d4aa",
  },
  {
    id: 5,
    user: "Lisa Wang",
    action: "updated status",
    target: "Database Migration",
    time: "3h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    color: "#a78bfa",
  },
];

const topProjects = [
  { name: "E-Commerce Platform", progress: 85, tasks: 42, color: "#6c63ff" },
  { name: "Mobile App Redesign", progress: 62, tasks: 28, color: "#00d4aa" },
  { name: "API Integration", progress: 45, tasks: 19, color: "#ff6b35" },
  { name: "Dashboard Analytics", progress: 91, tasks: 35, color: "#22c55e" },
];

const AdminDashboard = () => {
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
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
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
    <PageWrapper title="Admin Dashboard">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
          boxShadow: "0 8px 32px rgba(255,107,53,0.3)",
        }}
      >
        <div className="relative z-10">
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Good{" "}
            {new Date().getHours() < 12
              ? "Morning"
              : new Date().getHours() < 18
                ? "Afternoon"
                : "Evening"}
            , {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p
            className="text-orange-100 text-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Here's what's happening across your workspace today.
          </p>
        </div>
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: "white" }}
        />
        <div
          className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={128}
          icon={MdPeople}
          color="#ff6b35"
          gradient="linear-gradient(135deg, #ff6b35, #ff8c5a)"
          change={12}
        />
        <StatsCard
          title="Active Projects"
          value={24}
          icon={MdFolder}
          color="#6c63ff"
          gradient="linear-gradient(135deg, #6c63ff, #8b85ff)"
          change={8}
        />
        <StatsCard
          title="Total Tasks"
          value={763}
          icon={MdTask}
          color="#00d4aa"
          gradient="linear-gradient(135deg, #00d4aa, #00f5c8)"
          change={-3}
        />
        <StatsCard
          title="Completion Rate"
          value={87}
          icon={MdTrendingUp}
          color="#a78bfa"
          gradient="linear-gradient(135deg, #a78bfa, #c4b5fd)"
          change={5}
          suffix="%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Bar Chart */}
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
            Task Overview
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskData} barSize={8} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis
                dataKey="month"
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
                dataKey="completed"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
              <Bar
                dataKey="inProgress"
                fill="#6c63ff"
                radius={[4, 4, 0, 0]}
                name="In Progress"
              />
              <Bar
                dataKey="pending"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
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
            Task Status
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
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
          <div className="flex items-center gap-2 mb-4">
            <FiActivity size={18} style={{ color: "#ff6b35" }} />
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: isDark ? "#0d0d18" : "#f8fafc",
                  animation: `slideUp 0.3s ease ${i * 0.1}s both`,
                }}
              >
                <img
                  src={item.avatar}
                  alt={item.user}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ border: `2px solid ${item.color}` }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm"
                    style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                  >
                    <span className="font-semibold">{item.user}</span>{" "}
                    <span style={{ color: muted }}>{item.action}</span>{" "}
                    <span className="font-medium" style={{ color: item.color }}>
                      {item.target}
                    </span>
                  </p>
                </div>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
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
            Top Projects
          </h3>
          <div className="space-y-4">
            {topProjects.map((project, i) => (
              <div
                key={project.name}
                style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: text,
                      fontFamily: "DM Sans, sans-serif",
                      maxWidth: "70%",
                    }}
                  >
                    {project.name}
                  </p>
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
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {project.tasks} tasks
                </p>
              </div>
            ))}
          </div>

          {/* Weekly Active Users Line Chart */}
          <h3
            className="text-base font-bold mt-6 mb-3"
            style={{ fontFamily: "Syne, sans-serif", color: text }}
          >
            Weekly Active Users
          </h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={lineData}>
              <XAxis
                dataKey="day"
                tick={{ fill: muted, fontSize: 10, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#ff6b35"
                strokeWidth={2}
                dot={false}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
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

export default AdminDashboard;
