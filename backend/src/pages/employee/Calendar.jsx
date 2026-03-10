import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TASKS_BY_DATE = {
  "2025-07-25": [
    { title: "Fix Navbar Bug", color: "#ef4444", priority: "High" },
  ],
  "2025-07-26": [
    { title: "Design Login Page", color: "#6c63ff", priority: "High" },
    { title: "API Docs", color: "#f59e0b", priority: "Medium" },
  ],
  "2025-07-28": [
    { title: "Code Review", color: "#00d4aa", priority: "Medium" },
  ],
  "2025-07-30": [{ title: "Unit Tests", color: "#22c55e", priority: "Low" }],
  "2025-08-01": [
    { title: "Deploy Staging", color: "#a78bfa", priority: "Medium" },
  ],
  "2025-08-05": [
    { title: "Sprint Review", color: "#ff6b35", priority: "High" },
  ],
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
  const { isDark } = useTheme();
  const today = new Date();
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [selected, setSelected] = useState(null);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const hoverBg = isDark ? "#1a1a2e" : "#f8fafc";

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prevMonth = () =>
    setCurrent((p) =>
      p.month === 0
        ? { month: 11, year: p.year - 1 }
        : { ...p, month: p.month - 1 },
    );
  const nextMonth = () =>
    setCurrent((p) =>
      p.month === 11
        ? { month: 0, year: p.year + 1 }
        : { ...p, month: p.month + 1 },
    );

  const getDateKey = (day) =>
    `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();
  const isSelected = (day) => selected === getDateKey(day);

  const selectedTasks = selected ? TASKS_BY_DATE[selected] || [] : [];

  return (
    <PageWrapper title="Calendar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
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
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "Syne, sans-serif", color: text }}
            >
              {MONTHS[current.month]} {current.year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: hoverBg, color: text }}
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: hoverBg, color: text }}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold py-2"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {Array(daysInMonth)
              .fill(null)
              .map((_, i) => {
                const day = i + 1;
                const key = getDateKey(day);
                const hasTasks = TASKS_BY_DATE[key];
                return (
                  <button
                    key={day}
                    onClick={() => setSelected(isSelected(day) ? null : key)}
                    className="relative flex flex-col items-center justify-start p-1.5 rounded-xl transition-all duration-200 hover:scale-105 min-h-12"
                    style={{
                      backgroundColor: isSelected(day)
                        ? "#a78bfa20"
                        : isToday(day)
                          ? "#a78bfa10"
                          : "transparent",
                      border: `1px solid ${isSelected(day) ? "#a78bfa" : isToday(day) ? "#a78bfa50" : "transparent"}`,
                    }}
                  >
                    <span
                      className="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        color: isToday(day) ? "#a78bfa" : text,
                        fontWeight: isToday(day) ? 700 : 400,
                        backgroundColor: isToday(day)
                          ? "#a78bfa15"
                          : "transparent",
                      }}
                    >
                      {day}
                    </span>
                    {hasTasks && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {TASKS_BY_DATE[key].slice(0, 3).map((t, ti) => (
                          <div
                            key={ti}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: t.color }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Selected Day Tasks */}
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
            {selected ? `Tasks on ${selected}` : "Select a date"}
          </h3>
          {selectedTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedTasks.map((task, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${task.color}10`,
                    border: `1px solid ${task.color}30`,
                    animation: "slideUp 0.2s ease forwards",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                  >
                    {task.title}
                  </p>
                  <span
                    className="text-xs mt-1 inline-block px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: `${task.color}20`,
                      color: task.color,
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p
                className="text-sm"
                style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
              >
                {selected
                  ? "No tasks on this day 🎉"
                  : "Click a date to see tasks"}
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default Calendar;
