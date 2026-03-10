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
} from "recharts";

const weeklyData = [
  { week: "W1", completed: 12, added: 18 },
  { week: "W2", completed: 19, added: 14 },
  { week: "W3", completed: 15, added: 20 },
  { week: "W4", completed: 25, added: 16 },
];

const memberData = [
  { name: "John", tasks: 8, done: 5, color: "#6c63ff" },
  { name: "Amy", tasks: 6, done: 6, color: "#00d4aa" },
  { name: "Mike", tasks: 10, done: 4, color: "#ff6b35" },
  { name: "Lisa", tasks: 7, done: 7, color: "#a78bfa" },
];

const pieData = [
  { name: "Done", value: 22, color: "#22c55e" },
  { name: "In Progress", value: 8, color: "#6c63ff" },
  { name: "Todo", value: 11, color: "#f59e0b" },
];

const Reports = () => {
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
    <PageWrapper title="Reports">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Weekly Progress */}
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
            Weekly Progress
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={14} barGap={4}>
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
              <Bar
                dataKey="completed"
                fill="#00d4aa"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
              <Bar
                dataKey="added"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Added"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie */}
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
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className="text-xs"
                  style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                >
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
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
          Team Performance
        </h3>
        <div className="space-y-4">
          {memberData.map((member, i) => {
            const pct = Math.round((member.done / member.tasks) * 100);
            return (
              <div
                key={member.name}
                style={{ animation: `slideUp 0.3s ease ${i * 0.1}s both` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                      className="w-7 h-7 rounded-full"
                      style={{ border: `2px solid ${member.color}` }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {member.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {member.done}/{member.tasks} tasks
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: member.color,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${member.color}20` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: member.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Reports;
