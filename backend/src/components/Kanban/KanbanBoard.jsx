import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTheme } from "../../context/ThemeContext";
import { FiPlus, FiX, FiClock, FiUser } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import toast from "react-hot-toast";

const INITIAL_COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    color: "#f59e0b",
    icon: "📋",
    tasks: [
      {
        id: "t1",
        title: "Design Homepage Layout",
        priority: "High",
        assignee: "John",
        due: "Jul 28",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        tags: ["Design", "UI"],
      },
      {
        id: "t2",
        title: "Setup MongoDB Schema",
        priority: "Medium",
        assignee: "Amy",
        due: "Jul 30",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
        tags: ["Backend"],
      },
      {
        id: "t3",
        title: "Write Unit Tests",
        priority: "Low",
        assignee: "Mike",
        due: "Aug 1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        tags: ["Testing"],
      },
    ],
  },
  inprogress: {
    id: "inprogress",
    title: "In Progress",
    color: "#6c63ff",
    icon: "⚡",
    tasks: [
      {
        id: "t4",
        title: "Auth API Endpoints",
        priority: "High",
        assignee: "Lisa",
        due: "Jul 26",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        tags: ["Backend", "API"],
      },
      {
        id: "t5",
        title: "Dashboard UI Components",
        priority: "Medium",
        assignee: "John",
        due: "Jul 27",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        tags: ["Frontend"],
      },
    ],
  },
  review: {
    id: "review",
    title: "In Review",
    color: "#00d4aa",
    icon: "🔍",
    tasks: [
      {
        id: "t6",
        title: "Login Page Component",
        priority: "High",
        assignee: "Amy",
        due: "Jul 25",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
        tags: ["Frontend", "UI"],
      },
      {
        id: "t7",
        title: "Payment Integration",
        priority: "Medium",
        assignee: "Mike",
        due: "Jul 28",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        tags: ["Backend"],
      },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    color: "#22c55e",
    icon: "✅",
    tasks: [
      {
        id: "t8",
        title: "Project Setup & Config",
        priority: "Low",
        assignee: "Lisa",
        due: "Jul 20",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        tags: ["DevOps"],
      },
      {
        id: "t9",
        title: "Wireframes & Mockups",
        priority: "Medium",
        assignee: "John",
        due: "Jul 22",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        tags: ["Design"],
      },
      {
        id: "t10",
        title: "Database ERD",
        priority: "High",
        assignee: "Amy",
        due: "Jul 23",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
        tags: ["Backend"],
      },
    ],
  },
};

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

const COL_ORDER = ["todo", "inprogress", "review", "done"];

const KanbanBoard = () => {
  const { isDark } = useTheme();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [addingTo, setAddingTo] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    assignee: "",
    due: "",
    tag: "",
  });
  const [selectedTask, setSelectedTask] = useState(null);

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const colBg = isDark ? "#0d0d18" : "#f1f5f9";
  const inputBg = isDark ? "#12121f" : "#ffffff";

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    const srcCol = {
      ...columns[source.droppableId],
      tasks: [...columns[source.droppableId].tasks],
    };
    const destCol = {
      ...columns[destination.droppableId],
      tasks: [...columns[destination.droppableId].tasks],
    };
    const [moved] = srcCol.tasks.splice(source.index, 1);
    if (source.droppableId === destination.droppableId) {
      srcCol.tasks.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: srcCol });
    } else {
      destCol.tasks.splice(destination.index, 0, moved);
      setColumns({
        ...columns,
        [source.droppableId]: srcCol,
        [destination.droppableId]: destCol,
      });
      toast.success(`Moved to "${columns[destination.droppableId].title}"!`, {
        icon: "🎯",
      });
    }
  };

  const addTask = (colId) => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required!");
      return;
    }
    const task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      priority: newTask.priority,
      assignee: newTask.assignee || "Unassigned",
      due: newTask.due || "No due date",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTask.assignee || "default"}`,
      tags: newTask.tag ? [newTask.tag] : [],
    };
    setColumns({
      ...columns,
      [colId]: { ...columns[colId], tasks: [...columns[colId].tasks, task] },
    });
    setNewTask({
      title: "",
      priority: "Medium",
      assignee: "",
      due: "",
      tag: "",
    });
    setAddingTo(null);
    toast.success("Task added!", { icon: "✅" });
  };

  const deleteTask = (colId, taskId) => {
    setColumns({
      ...columns,
      [colId]: {
        ...columns[colId],
        tasks: columns[colId].tasks.filter((t) => t.id !== taskId),
      },
    });
    if (selectedTask?.id === taskId) setSelectedTask(null);
    toast.success("Task deleted!");
  };

  const totalTasks = Object.values(columns).reduce(
    (sum, col) => sum + col.tasks.length,
    0,
  );
  const doneTasks = columns.done.tasks.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: text }}
          >
            Kanban Board
          </h2>
          <p
            className="text-sm mt-0.5"
            style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
          >
            {doneTasks}/{totalTasks} tasks completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-32 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: isDark ? "#1e1e30" : "#e2e8f0" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`,
                background: "linear-gradient(90deg, #6c63ff, #00d4aa)",
              }}
            />
          </div>
          <span
            className="text-sm font-bold"
            style={{ color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}
          >
            {totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COL_ORDER.map((colId) => {
            const col = columns[colId];
            return (
              <div
                key={colId}
                className="flex-shrink-0 flex flex-col rounded-2xl"
                style={{
                  width: "272px",
                  backgroundColor: colBg,
                  border: `1px solid ${border}`,
                  minHeight: "520px",
                }}
              >
                {/* Column Header */}
                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{col.icon}</span>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: text, fontFamily: "Syne, sans-serif" }}
                      >
                        {col.title}
                      </h3>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: `${col.color}25`,
                          color: col.color,
                        }}
                      >
                        {col.tasks.length}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setAddingTo(addingTo === colId ? null : colId)
                      }
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        backgroundColor: `${col.color}20`,
                        color: col.color,
                      }}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <div
                    className="h-0.5 rounded-full"
                    style={{ backgroundColor: `${col.color}40` }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: col.tasks.length > 0 ? "100%" : "0%",
                        backgroundColor: col.color,
                      }}
                    />
                  </div>
                </div>

                {/* Add Task Form */}
                {addingTo === colId && (
                  <div
                    className="mx-3 mb-2 p-3 rounded-xl"
                    style={{
                      backgroundColor: cardBg,
                      border: `1px solid ${col.color}50`,
                      animation: "slideDown 0.25s ease",
                    }}
                  >
                    <input
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Task title..."
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg outline-none text-xs mb-2"
                      style={{
                        backgroundColor: inputBg,
                        border: `1px solid ${border}`,
                        color: text,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      onKeyDown={(e) => e.key === "Enter" && addTask(colId)}
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({ ...newTask, priority: e.target.value })
                        }
                        className="px-2 py-1.5 rounded-lg outline-none text-xs"
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
                      <input
                        value={newTask.assignee}
                        onChange={(e) =>
                          setNewTask({ ...newTask, assignee: e.target.value })
                        }
                        placeholder="Assignee"
                        className="px-2 py-1.5 rounded-lg outline-none text-xs"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${border}`,
                          color: text,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      />
                      <input
                        value={newTask.due}
                        onChange={(e) =>
                          setNewTask({ ...newTask, due: e.target.value })
                        }
                        placeholder="Due date"
                        className="px-2 py-1.5 rounded-lg outline-none text-xs"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${border}`,
                          color: text,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      />
                      <input
                        value={newTask.tag}
                        onChange={(e) =>
                          setNewTask({ ...newTask, tag: e.target.value })
                        }
                        placeholder="Tag"
                        className="px-2 py-1.5 rounded-lg outline-none text-xs"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${border}`,
                          color: text,
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addTask(colId)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: col.color,
                          color: "white",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => setAddingTo(null)}
                        className="px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          backgroundColor: isDark ? "#1e1e30" : "#e2e8f0",
                          color: muted,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Droppable */}
                <Droppable droppableId={colId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 px-3 pb-3 space-y-2 min-h-24 rounded-b-2xl transition-colors duration-200"
                      style={{
                        backgroundColor: snapshot.isDraggingOver
                          ? `${col.color}08`
                          : "transparent",
                      }}
                    >
                      {col.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() =>
                                setSelectedTask(
                                  selectedTask?.id === task.id ? null : task,
                                )
                              }
                              className="rounded-xl p-3 group cursor-pointer"
                              style={{
                                backgroundColor: cardBg,
                                border: `1px solid ${snapshot.isDragging ? col.color : selectedTask?.id === task.id ? col.color + "80" : border}`,
                                boxShadow: snapshot.isDragging
                                  ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 2px ${col.color}40`
                                  : isDark
                                    ? "0 2px 8px rgba(0,0,0,0.25)"
                                    : "0 2px 8px rgba(0,0,0,0.06)",
                                transform: snapshot.isDragging
                                  ? "rotate(1.5deg) scale(1.02)"
                                  : "none",
                                transition:
                                  "box-shadow 0.2s, border-color 0.2s",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-0.5 opacity-30 hover:opacity-80 cursor-grab active:cursor-grabbing flex-shrink-0"
                                >
                                  <MdDragIndicator
                                    size={15}
                                    style={{ color: muted }}
                                  />
                                </div>
                                <p
                                  className="flex-1 text-xs font-semibold leading-snug"
                                  style={{
                                    color: text,
                                    fontFamily: "DM Sans, sans-serif",
                                  }}
                                >
                                  {task.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(colId, task.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                                  style={{
                                    color: "#ef4444",
                                    backgroundColor: "rgba(239,68,68,0.1)",
                                  }}
                                >
                                  <FiX size={11} />
                                </button>
                              </div>
                              {task.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2 pl-5">
                                  {task.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 rounded-md"
                                      style={{
                                        backgroundColor: `${col.color}15`,
                                        color: col.color,
                                        fontFamily: "DM Sans, sans-serif",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between pl-5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-1.5 py-0.5 rounded-md font-medium"
                                    style={{
                                      backgroundColor:
                                        PRIORITY_CONFIG[task.priority].bg,
                                      color:
                                        PRIORITY_CONFIG[task.priority].color,
                                      fontFamily: "DM Sans, sans-serif",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {task.priority}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <FiClock
                                      size={10}
                                      style={{ color: muted }}
                                    />
                                    <span
                                      style={{
                                        color: muted,
                                        fontFamily: "DM Sans, sans-serif",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {task.due}
                                    </span>
                                  </div>
                                </div>
                                <img
                                  src={task.avatar}
                                  alt={task.assignee}
                                  className="w-5 h-5 rounded-full"
                                  style={{ border: `1.5px solid ${col.color}` }}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {col.tasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 opacity-40">
                          <div className="text-2xl mb-2">{col.icon}</div>
                          <p
                            className="text-xs"
                            style={{
                              color: muted,
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          >
                            Drop tasks here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              animation: "scaleIn 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3
                className="text-lg font-bold pr-4"
                style={{ fontFamily: "Syne, sans-serif", color: text }}
              >
                {selectedTask.title}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{
                  backgroundColor: isDark ? "#1e1e30" : "#f1f5f9",
                  color: muted,
                }}
              >
                <FiX size={15} />
              </button>
            </div>
            <div className="space-y-3">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc" }}
              >
                <FiUser size={15} style={{ color: muted }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    Assignee
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <img
                      src={selectedTask.avatar}
                      className="w-5 h-5 rounded-full"
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                    >
                      {selectedTask.assignee}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: isDark ? "#0d0d18" : "#f8fafc" }}
              >
                <FiClock size={15} style={{ color: muted }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}
                  >
                    Due Date
                  </p>
                  <p
                    className="text-sm font-medium mt-0.5"
                    style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
                  >
                    {selectedTask.due}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    backgroundColor: PRIORITY_CONFIG[selectedTask.priority].bg,
                    color: PRIORITY_CONFIG[selectedTask.priority].color,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {selectedTask.priority} Priority
                </span>
                {selectedTask.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(108,99,255,0.1)",
                      color: "#6c63ff",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.92); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
