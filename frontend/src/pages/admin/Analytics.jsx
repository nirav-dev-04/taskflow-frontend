import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
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
  AreaChart,
  Area,
} from "recharts";

const monthlyData = [
  { month: "Jan", tasks: 65, users: 20, projects: 3 },
  { month: "Feb", tasks: 80, users: 25, projects: 4 },
  { month: "Mar", tasks: 72, users: 30, projects: 4 },
  { month: "Apr", tasks: 95, users: 40, projects: 6 },
  { month: "May", tasks: 88, users: 45, projects: 5 },
  { month: "Jun", tasks: 110, users: 55, projects: 7 },
  { month: "Jul", tasks: 125, users: 65, projects: 8 },
];

const teamPerformance = [
  { name: "Sara Chen", completed: 42, color: "#00d4aa" },
  { name: "Lisa Wang", completed: 38, color: "#a78bfa" },
  { name: "John Smith", completed: 28, color: "#6c63ff" },
  { name: "Amy Lee", completed: 35, color: "#ff6b35" },
  { name: "Mike Davis", completed: 20, color: "#f59e0b" },
];

const pieData = [
  { name: "Completed", value: 445, color: "#22c55e" },
  { name: "In Progress", value: 200, color: "#6c63ff" },
  { name: "Pending", value: 88, color: "#f59e0b" },
  { name: "Overdue", value: 30, color: "#ef4444" },
];

const areaData = [
  { week: "W1", active: 45, new: 12 },
  { week: "W2", active: 52, new: 18 },
  { week: "W3", active: 48, new: 10 },
  { week: "W4", active: 65, new: 22 },
  { week: "W5", active: 70, new: 15 },
  { week: "W6", active: 80, new: 25 },
];

const Analytics = () => {
  const { isDark } = useTheme();
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
            className="text-xs font-bold mb-1"
            style={{ color: text, fontFamily: "Syne, sans-serif" }}
          >
            {label}
          </p>
          {payload.map((p, i) => (
            <p
              key={i}
              className="text-xs"
              style={{ color: p.color, fontFamily: "DM Sans" }}
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
    <PageWrapper title="Analytics">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "Total Tasks",
            value: "763",
            change: "+12%",
            color: "#ff6b35",
          },
          {
            label: "Completed",
            value: "445",
            change: "+18%",
            color: "#22c55e",
          },
          {
            label: "Active Users",
            value: "128",
            change: "+8%",
            color: "#6c63ff",
          },
          {
            label: "Avg. Score",
            value: "87%",
            change: "+5%",
            color: "#00d4aa",
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.06)",
              animation: `slideUp 0.3s ease ${i * 0.1}s both`,
            }}
          >
            <p
              className="text-2xl font-black"
              style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
            >
              {stat.label}
            </p>
            <span
              className="text-xs font-semibold"
              style={{ color: "#22c55e", fontFamily: "DM Sans, sans-serif" }}
            >
              {stat.change} this month
            </span>
          </div>
        ))}
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
            Monthly Tasks
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="tasks"
                stroke="#ff6b35"
                strokeWidth={2}
                fill="url(#taskGrad)"
                name="Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridBg} />
              <XAxis
                dataKey="week"
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
              <Area
                type="monotone"
                dataKey="active"
                stroke="#6c63ff"
                strokeWidth={2}
                fill="url(#userGrad)"
                name="Active"
              />
              <Area
                type="monotone"
                dataKey="new"
                stroke="#00d4aa"
                strokeWidth={2}
                fill="none"
                name="New"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Performance */}
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
            Team Performance
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={teamPerformance} layout="vertical" barSize={10}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridBg}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="completed"
                radius={[0, 4, 4, 0]}
                name="Tasks Completed"
              >
                {teamPerformance.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Breakdown Pie */}
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
            Task Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
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
          <div className="space-y-2 mt-3">
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
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Analytics;
