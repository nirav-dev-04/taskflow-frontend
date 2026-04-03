import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiPlus, FiX, FiLock } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../services/api";

const PRIORITY_CONFIG = {
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  label: "High" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Medium" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  label: "Low" },
  critical: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", label: "Critical" },
};

const COLUMNS = {
  todo:        { id: "todo",        title: "To Do",       color: "#f59e0b", tasks: [] },
  in_progress: { id: "in_progress", title: "In Progress", color: "#6c63ff", tasks: [] },
  review:      { id: "review",      title: "Review",      color: "#00d4aa", tasks: [] },
  done:        { id: "done",        title: "Done",        color: "#22c55e", tasks: [] },
};
const COL_ORDER = ["todo", "in_progress", "review", "done"];

const SprintBoard = () => {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const [columns, setColumns] = useState(() => {
    const cols = {};
    COL_ORDER.forEach(id => cols[id] = { ...COLUMNS[id], tasks: [] });
    return cols;
  });
  const [allTasksMap, setAllTasksMap] = useState({}); // id → task for dependency lookup
  const [addingTo, setAddingTo]       = useState(null);
  const [newTask, setNewTask]         = useState({ title: "", priority: "medium", dependsOn: "" });
  const [loading, setLoading]         = useState(true);
  const [projects, setProjects]       = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const colBg   = isDark ? "#0d0d18" : "#f8fafc";
  const inputBg = isDark ? "#12121f" : "#ffffff";

  const loadTasks = (allTasks, projectIds) => {
    const cols = {};
    COL_ORDER.forEach(id => cols[id] = { ...COLUMNS[id], tasks: [] });

    // Build a map of all tasks for dependency lookup
    const taskMap = {};
    allTasks.forEach(t => { taskMap[t._id] = t; });
    setAllTasksMap(taskMap);

    allTasks
      .filter(t => projectIds.has(t.project?._id || t.project))
      .forEach(t => {
        const colId    = COL_ORDER.includes(t.status) ? t.status : "todo";
        const assignees = t.assignees || [];

        // Check if blocked — any dependency not "done"
        const deps = t.dependencies || [];
        const isBlocked = deps.some(d => {
          const depId  = d._id || d;
          const depTask = taskMap[depId];
          return depTask && depTask.status !== "done";
        });

        cols[colId].tasks.push({
          id:           t._id,
          title:        t.title,
          priority:     t.priority || "medium",
          assignee:     assignees[0]?.name || "Unassigned",
          project:      t.project?._id || t.project,
          isBlocked,
          dependencies: deps,
          subtasks:     t.subtasks || [],
          timeLogged:   (t.timeTracking?.logs || []).reduce((s, l) => s + (l.hours || 0), 0),
        });
      });
    setColumns(cols);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
        ]);
        const allProjects = projectsRes.projects || projectsRes || [];
        const allTasks    = tasksRes.tasks    || tasksRes    || [];
        const managed     = allProjects.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        setProjects(managed);
        const projectIds = new Set(managed.map(p => p._id));
        loadTasks(allTasks, projectIds);
      } catch (err) {
        console.error("Sprint board error", err);
        toast.error("Failed to load sprint board");
      } finally { setLoading(false); }
    };
    if (user?._id) fetchData();
  }, [user]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Check if task is blocked before moving out of todo
    const srcCol = columns[source.droppableId];
    const movedTask = srcCol.tasks.find(t => t.id === draggableId);
    if (movedTask?.isBlocked && destination.droppableId !== "todo") {
      toast.error("🔒 This task is blocked by a dependency!");
      return;
    }

    const srcColCopy  = { ...columns[source.droppableId],      tasks: [...columns[source.droppableId].tasks] };
    const destColCopy = { ...columns[destination.droppableId], tasks: [...columns[destination.droppableId].tasks] };
    const [moved]     = srcColCopy.tasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      srcColCopy.tasks.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: srcColCopy });
    } else {
      destColCopy.tasks.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: srcColCopy, [destination.droppableId]: destColCopy });
      try {
        await api.patch(`/tasks/${draggableId}/status`, { status: destination.droppableId });
        toast.success(`Moved to ${COLUMNS[destination.droppableId].title}!`);
      } catch { toast.error("Failed to update task status"); }
    }
  };

  // Get all tasks in current project for dependency selector
  const projectTasks = Object.values(columns).flatMap(c => c.tasks);

  const addTask = async (colId) => {
    if (!newTask.title.trim()) { toast.error("Task title required"); return; }
    if (!selectedProject)      { toast.error("Please select a project first"); return; }
    try {
      const res = await api.post("/tasks", {
        title:        newTask.title,
        priority:     newTask.priority,
        status:       colId,
        project:      selectedProject,
        dependencies: newTask.dependsOn ? [newTask.dependsOn] : [],
      });
      const created = res.task || res;
      const isBlocked = newTask.dependsOn
        ? columns[colId].tasks.find(t => t.id === newTask.dependsOn)?.id !== undefined &&
          Object.values(columns).find(c => c.tasks.find(t => t.id === newTask.dependsOn))?.id !== "done"
        : false;

      setColumns(prev => ({
        ...prev,
        [colId]: {
          ...prev[colId],
          tasks: [...prev[colId].tasks, {
            id:           created._id,
            title:        created.title,
            priority:     created.priority || "medium",
            assignee:     "Unassigned",
            isBlocked,
            dependencies: newTask.dependsOn ? [newTask.dependsOn] : [],
            subtasks:     [],
            timeLogged:   0,
          }],
        },
      }));
      setNewTask({ title: "", priority: "medium", dependsOn: "" });
      setAddingTo(null);
      toast.success("Task added!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create task"); }
  };

  const deleteTask = async (colId, taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setColumns(prev => ({ ...prev, [colId]: { ...prev[colId], tasks: prev[colId].tasks.filter(t => t.id !== taskId) } }));
      toast.success("Task deleted!");
    } catch { toast.error("Failed to delete task"); }
  };

  if (loading) return (
    <PageWrapper title="Sprint Board">
      <div className="text-center py-12">
        <p className="text-lg font-semibold" style={{ color: muted, fontFamily: "Syne, sans-serif" }}>Loading sprint board...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Sprint Board">
      {/* Project selector */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif", minWidth: 220 }}>
          <option value="">Select project to add tasks...</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {/* Legend */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <FiLock size={12} style={{ color: "#ef4444" }} />
          <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>= Blocked by dependency</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COL_ORDER.map(colId => {
            const col = columns[colId];
            return (
              <div key={colId} className="shrink-0 w-64 rounded-2xl flex flex-col"
                style={{ backgroundColor: colBg, border: `1px solid ${border}`, minHeight: "500px" }}>
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="text-sm font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{col.title}</h3>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${col.color}20`, color: col.color, fontFamily: "DM Sans, sans-serif" }}>
                      {col.tasks.length}
                    </span>
                  </div>
                  <button onClick={() => setAddingTo(addingTo === colId ? null : colId)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${col.color}20`, color: col.color }}>
                    <FiPlus size={14} />
                  </button>
                </div>

                {addingTo === colId && (
                  <div className="mx-3 mb-2 p-3 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${col.color}40`, animation: "slideUp 0.2s ease" }}>
                    <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title..."
                      className="w-full px-3 py-2 rounded-lg outline-none text-xs mb-2"
                      style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}
                      onKeyDown={e => e.key === "Enter" && addTask(colId)} />
                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg outline-none text-xs mb-2"
                      style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
                      {["low", "medium", "high", "critical"].map(p => <option key={p}>{p}</option>)}
                    </select>
                    {/* Dependency selector */}
                    <select value={newTask.dependsOn} onChange={e => setNewTask({ ...newTask, dependsOn: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg outline-none text-xs mb-2"
                      style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
                      <option value="">No dependency</option>
                      {projectTasks.map(t => (
                        <option key={t.id} value={t.id}>🔗 Depends on: {t.title}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => addTask(colId)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ backgroundColor: col.color, color: "white", fontFamily: "DM Sans, sans-serif" }}>Add</button>
                      <button onClick={() => setAddingTo(null)}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                        style={{ backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", color: muted }}>Cancel</button>
                    </div>
                  </div>
                )}

                <Droppable droppableId={colId}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className="flex-1 px-3 pb-3 space-y-2 min-h-24 transition-colors duration-200"
                      style={{ backgroundColor: snapshot.isDraggingOver ? `${col.color}08` : "transparent" }}>
                      {col.tasks.map((task, index) => {
                        const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        const doneSubs = (task.subtasks || []).filter(s => s.isCompleted).length;
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className="rounded-xl p-3 group"
                                style={{
                                  backgroundColor: cardBg,
                                  border: `1px solid ${task.isBlocked ? "#ef444450" : snapshot.isDragging ? col.color : border}`,
                                  boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.3)" : isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                                  transform: snapshot.isDragging ? "rotate(2deg)" : "none",
                                  opacity: task.isBlocked ? 0.85 : 1,
                                  ...provided.draggableProps.style,
                                }}>
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-0.5 opacity-40 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                    <MdDragIndicator size={14} style={{ color: muted }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {/* Blocked badge */}
                                    {task.isBlocked && (
                                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "2px 6px", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)", width: "fit-content" }}>
                                        <FiLock size={10} style={{ color: "#ef4444" }} />
                                        <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>BLOCKED</span>
                                      </div>
                                    )}

                                    <p className="text-xs font-semibold mb-2 leading-tight" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{task.title}</p>

                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ backgroundColor: pc.bg, color: pc.color, fontFamily: "DM Sans, sans-serif" }}>{pc.label}</span>
                                      <span className="text-xs" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>{task.assignee}</span>
                                    </div>

                                    {/* Subtask mini bar */}
                                    {task.subtasks?.length > 0 && (
                                      <div style={{ marginTop: 4 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                          <span style={{ fontSize: 9, color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>
                                            ✓ {doneSubs}/{task.subtasks.length} subs
                                          </span>
                                        </div>
                                        <div style={{ height: 2, borderRadius: 2, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden" }}>
                                          <div style={{ height: "100%", width: `${task.subtasks.length > 0 ? Math.round((doneSubs / task.subtasks.length) * 100) : 0}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 2 }} />
                                        </div>
                                      </div>
                                    )}

                                    {/* Time logged badge */}
                                    {task.timeLogged > 0 && (
                                      <div style={{ marginTop: 4 }}>
                                        <span style={{ fontSize: 9, color: "#ff6b35", fontFamily: "DM Sans, sans-serif" }}>⏱️ {task.timeLogged}h logged</span>
                                      </div>
                                    )}
                                  </div>
                                  <button onClick={() => deleteTask(colId, task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shrink-0"
                                    style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                                    <FiX size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default SprintBoard;