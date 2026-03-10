import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiPlus, FiX } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import toast from "react-hot-toast";

const INITIAL_COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    color: "#f59e0b",
    tasks: [
      {
        id: "t1",
        title: "Design Homepage",
        priority: "High",
        assignee: "John",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
      {
        id: "t2",
        title: "Setup Database",
        priority: "Medium",
        assignee: "Amy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
      },
    ],
  },
  inprogress: {
    id: "inprogress",
    title: "In Progress",
    color: "#6c63ff",
    tasks: [
      {
        id: "t3",
        title: "Auth API",
        priority: "High",
        assignee: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      },
      {
        id: "t4",
        title: "Dashboard UI",
        priority: "Medium",
        assignee: "Lisa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      },
    ],
  },
  review: {
    id: "review",
    title: "Review",
    color: "#00d4aa",
    tasks: [
      {
        id: "t5",
        title: "Login Component",
        priority: "High",
        assignee: "John",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    color: "#22c55e",
    tasks: [
      {
        id: "t6",
        title: "Project Setup",
        priority: "Low",
        assignee: "Amy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
      },
      {
        id: "t7",
        title: "Wireframes",
        priority: "Medium",
        assignee: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      },
    ],
  },
};

const PRIORITY_CONFIG = {
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const COL_ORDER = ["todo", "inprogress", "review", "done"];

const SprintBoard = () => {
  const { isDark } = useTheme();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [addingTo, setAddingTo] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    assignee: "",
  });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const colBg = isDark ? "#0d0d18" : "#f8fafc";
  const inputBg = isDark ? "#12121f" : "#ffffff";

  const onDragEnd = (result) => {
    const { source, destination } = result;
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
      toast.success(`Moved to ${columns[destination.droppableId].title}!`);
    }
  };

  const addTask = (colId) => {
    if (!newTask.title.trim()) {
      toast.error("Task title required");
      return;
    }
    const task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      priority: newTask.priority,
      assignee: newTask.assignee || "Unassigned",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTask.assignee || "default"}`,
    };
    setColumns({
      ...columns,
      [colId]: { ...columns[colId], tasks: [...columns[colId].tasks, task] },
    });
    setNewTask({ title: "", priority: "Medium", assignee: "" });
    setAddingTo(null);
    toast.success("Task added!");
  };

  const deleteTask = (colId, taskId) => {
    setColumns({
      ...columns,
      [colId]: {
        ...columns[colId],
        tasks: columns[colId].tasks.filter((t) => t.id !== taskId),
      },
    });
    toast.success("Task deleted!");
  };

  return (
    <PageWrapper title="Sprint Board">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COL_ORDER.map((colId) => {
            const col = columns[colId];
            return (
              <div
                key={colId}
                // FIX: flex-shrink-0 → shrink-0
                className="shrink-0 w-64 rounded-2xl flex flex-col"
                style={{
                  backgroundColor: colBg,
                  border: `1px solid ${border}`,
                  minHeight: "500px",
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3
                      className="text-sm font-bold"
                      style={{ color: text, fontFamily: "Syne, sans-serif" }}
                    >
                      {col.title}
                    </h3>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${col.color}20`,
                        color: col.color,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {col.tasks.length}
                    </span>
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

                {/* Add Task Form */}
                {addingTo === colId && (
                  <div
                    className="mx-3 mb-2 p-3 rounded-xl"
                    style={{
                      backgroundColor: cardBg,
                      border: `1px solid ${col.color}40`,
                      animation: "slideUp 0.2s ease",
                    }}
                  >
                    <input
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Task title..."
                      className="w-full px-3 py-2 rounded-lg outline-none text-xs mb-2"
                      style={{
                        backgroundColor: inputBg,
                        border: `1px solid ${border}`,
                        color: text,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      onKeyDown={(e) => e.key === "Enter" && addTask(colId)}
                    />
                    <div className="flex gap-2 mb-2">
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({ ...newTask, priority: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 rounded-lg outline-none text-xs"
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
                        className="flex-1 px-2 py-1.5 rounded-lg outline-none text-xs"
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
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: col.color,
                          color: "white",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddingTo(null)}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                        style={{
                          backgroundColor: isDark ? "#1e1e30" : "#f1f5f9",
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
                      className="flex-1 px-3 pb-3 space-y-2 min-h-24 transition-colors duration-200"
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
                              className="rounded-xl p-3 group"
                              style={{
                                backgroundColor: cardBg,
                                border: `1px solid ${snapshot.isDragging ? col.color : border}`,
                                boxShadow: snapshot.isDragging
                                  ? "0 8px 24px rgba(0,0,0,0.3)"
                                  : isDark
                                    ? "0 2px 8px rgba(0,0,0,0.2)"
                                    : "0 2px 8px rgba(0,0,0,0.06)",
                                transform: snapshot.isDragging
                                  ? "rotate(2deg)"
                                  : "none",
                                transition:
                                  "box-shadow 0.2s, border-color 0.2s",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-0.5 opacity-40 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                >
                                  <MdDragIndicator
                                    size={14}
                                    style={{ color: muted }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-xs font-semibold mb-2 leading-tight"
                                    style={{
                                      color: text,
                                      fontFamily: "DM Sans, sans-serif",
                                    }}
                                  >
                                    {task.title}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                      style={{
                                        backgroundColor:
                                          PRIORITY_CONFIG[task.priority].bg,
                                        color:
                                          PRIORITY_CONFIG[task.priority].color,
                                        fontFamily: "DM Sans, sans-serif",
                                      }}
                                    >
                                      {task.priority}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <img
                                        src={task.avatar}
                                        alt={task.assignee}
                                        className="w-5 h-5 rounded-full"
                                      />
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: muted,
                                          fontFamily: "DM Sans, sans-serif",
                                        }}
                                      >
                                        {task.assignee}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* FIX: flex-shrink-0 → shrink-0 */}
                                <button
                                  onClick={() => deleteTask(colId, task.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shrink-0"
                                  style={{ color: "#ef4444" }}
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <style>{`
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </PageWrapper>
  );
};

export default SprintBoard;
