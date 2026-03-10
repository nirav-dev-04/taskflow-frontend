import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiMail, FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";

const TEAM = [
  {
    id: 1,
    name: "John Smith",
    role: "Frontend Developer",
    email: "john@taskflow.com",
    tasks: { total: 8, done: 5 },
    status: "online",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    projects: ["E-Commerce", "Mobile App"],
  },
  {
    id: 2,
    name: "Amy Lee",
    role: "Backend Developer",
    email: "amy@taskflow.com",
    tasks: { total: 6, done: 6 },
    status: "online",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
    projects: ["API Integration"],
  },
  {
    id: 3,
    name: "Mike Davis",
    role: "UI Designer",
    email: "mike@taskflow.com",
    tasks: { total: 10, done: 4 },
    status: "offline",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    projects: ["Mobile App", "E-Commerce"],
  },
  {
    id: 4,
    name: "Lisa Wang",
    role: "Full Stack Developer",
    email: "lisa@taskflow.com",
    tasks: { total: 7, done: 7 },
    status: "online",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    projects: ["E-Commerce", "API Integration"],
  },
];

const MyTeam = () => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const filtered = TEAM.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageWrapper title="My Team">
      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={15}
          style={{ color: muted }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
          style={{
            backgroundColor: inputBg,
            border: `1px solid ${border}`,
            color: text,
            fontFamily: "DM Sans, sans-serif",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((member, i) => {
          const completion = Math.round(
            (member.tasks.done / member.tasks.total) * 100,
          );
          return (
            <div
              key={member.id}
              className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${border}`,
                boxShadow: isDark
                  ? "0 4px 24px rgba(0,0,0,0.3)"
                  : "0 4px 24px rgba(0,0,0,0.06)",
                animation: `slideUp 0.4s ease ${i * 0.1}s both`,
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl"
                    style={{ border: "2px solid #00d4aa" }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor:
                        member.status === "online" ? "#22c55e" : "#6b6b8a",
                      borderColor: cardBg,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-bold"
                    style={{ color: text, fontFamily: "Syne, sans-serif" }}
                  >
                    {member.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: "#00d4aa",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {member.role}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FiMail size={12} style={{ color: muted }} />
                    <p
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {member.email}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{
                    backgroundColor:
                      member.status === "online"
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(107,107,138,0.1)",
                    color: member.status === "online" ? "#22c55e" : muted,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {member.status}
                </span>
              </div>

              {/* Task Progress */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span
                    className="text-xs"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    Task Completion
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: "#00d4aa",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {completion}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(0,212,170,0.1)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${completion}%`,
                      background: "linear-gradient(90deg, #00d4aa, #00f5c8)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <FiCheckCircle size={12} style={{ color: "#22c55e" }} />
                    <span
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {member.tasks.done} done
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock size={12} style={{ color: "#f59e0b" }} />
                    <span
                      className="text-xs"
                      style={{
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {member.tasks.total - member.tasks.done} remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div
                className="flex flex-wrap gap-2 pt-3"
                style={{ borderTop: `1px solid ${border}` }}
              >
                {member.projects.map((proj) => (
                  <span
                    key={proj}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: "rgba(0,212,170,0.1)",
                      color: "#00d4aa",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {proj}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default MyTeam;
