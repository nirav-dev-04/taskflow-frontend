import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiPlus, FiX, FiLock, FiRefreshCw } from "react-icons/fi";
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
  todo:        { id: "todo",        title: "To Do",       color: "#f59e0b" },
  in_progress: { id: "in_progress", title: "In Progress", color: "#6c63ff" },
  review:      { id: "review",      title: "Review",      color: "#00d4aa" },
  done:        { id: "done",        title: "Done",        color: "#22c55e" },
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
  const [projects, setProjects]               = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [activeSprint, setActiveSprint]       = useState(null);
  const [addingTo, setAddingTo]               = useState(null);
  const [newTask, setNewTask]                 = useState({ title: "", priority: "medium", dependsOn: "" });
  const [loading, setLoading]                 = useState(true);
  const [loadingSprint, setLoadingSprint]     = useState(false);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const colBg   = isDark ? "#0d0d18" : "#f8fafc";
  const inputBg = isDark ? "#12121f" : "#ffffff";

  // Load manager's projects
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/projects");
        const all = res.projects || res || [];
        const managed = all.filter(p => p.manager?._id === user?._id || p.manager === user?._id);
        setProjects(managed);
      } catch { toast.error("Failed to load projects"); }
      finally { setLoading(false); }
    };
    if (user?._id) load();
  }, [user]);

  // Load or auto-create sprint when project selected
  useEffect(() => {
    if (!selectedProject) return;
    loadSprint();
  }, [selectedProject]);

  const loadSprint = async () => {
    setLoadingSprint(true);
    try {
      // ✅ GET /api/sprints/active?project=ID
      // This auto-creates a sprint in MongoDB if none exists!
      const res = await api.get(`/sprints/active?project=${selectedProject}`);
      const sprint = res.sprint;
      setActiveSprint(sprint);
      buildColumns(sprint.tasks || []);
    } catch { toast.error("Failed to load sprint"); }
    finally { setLoadingSprint(false); }
  };

  const buildColumns = (tasks) => {
    const cols = {};
    COL_ORDER.forEach(id => cols[id] = { ...COLUMNS[id], tasks: [] });

    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id] = t; });

    tasks.forEach(t => {
      const colId = COL_ORDER.includes(t.status) ? t.status : "todo";
      const deps  = t.dependencies || [];
      const isBlocked = deps.some(d => {
        const dep = taskMap[d._id || d];
        return dep && dep.status !== "done";
      });
      cols[colId].tasks.push({
        id:        t._id,
        title:     t.title,
        priority:  t.priority || "medium",
        assignee:  t.assignees?.[0]?.name || "Unassigned",
        isBlocked,
        subtasks:  t.subtasks || [],
        timeLogged: (t.timeTracking?.logs || []).reduce((s, l) => s + (l.hours || 0), 0),
      });
    });
    setColumns(cols);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const movedTask = columns[source.droppableId].tasks.find(t => t.id === draggableId);
    if (movedTask?.isBlocked && destination.droppableId !== "todo") {
      toast.error("🔒 This task is blocked by a dependency!");
      return;
    }

    const srcCopy  = { ...columns[source.droppableId],      tasks: [...columns[source.droppableId].tasks] };
    const destCopy = { ...columns[destination.droppableId], tasks: [...columns[destination.droppableId].tasks] };
    const [moved]  = srcCopy.tasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      srcCopy.tasks.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: srcCopy });
    } else {
      destCopy.tasks.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: srcCopy, [destination.droppableId]: destCopy });
      try {
        await api.patch(`/tasks/${draggableId}/status`, { status: destination.droppableId });
        toast.success(`Moved to ${COLUMNS[destination.droppableId].title}!`);
      } catch { toast.error("Failed to update task status"); }
    }
  };

  const projectTasks = Object.values(columns).flatMap(c => c.tasks);

  const addTask = async (colId) => {
    if (!newTask.title.trim()) { toast.error("Task title required"); return; }
    if (!selectedProject)     { toast.error("Please select a project first"); return; }
    try {
      // 1. Create task in DB
      const res = await api.post("/tasks", {
        title:        newTask.title,
        priority:     newTask.priority,
        status:       colId,
        project:      selectedProject,
        dependencies: newTask.dependsOn ? [newTask.dependsOn] : [],
      });
      const created = res.task || res;

      // 2. ✅ Add task to sprint document in MongoDB
      if (activeSprint?._id) {
        await api.post(`/sprints/${activeSprint._id}/tasks`, { taskId: created._id });
      }

      setColumns(prev => ({
        ...prev,
        [colId]: {
          ...prev[colId],
          tasks: [...prev[colId].tasks, {
            id: created._id, title: created.title,
            priority: created.priority || "medium",
            assignee: "Unassigned", isBlocked: false,
            subtasks: [], timeLogged: 0,
          }],
        },
      }));
      setNewTask({ title: "", priority: "medium", dependsOn: "" });
      setAddingTo(null);
      toast.success("Task added to sprint!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create task"); }
  };

  const deleteTask = async (colId, taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      // ✅ Remove from sprint in DB
      if (activeSprint?._id) {
        await api.delete(`/sprints/${activeSprint._id}/tasks/${taskId}`);
      }
      setColumns(prev => ({
        ...prev,
        [colId]: { ...prev[colId], tasks: prev[colId].tasks.filter(t => t.id !== taskId) },
      }));
      toast.success("Task deleted!");
    } catch { toast.error("Failed to delete task"); }
  };

  if (loading) return (
    <PageWrapper title="Sprint Board">
      <div className="text-center py-12">
        <p style={{ color: muted, fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 600 }}>Loading...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Sprint Board">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif", minWidth: 240 }}>
          <option value="">Select project to view sprint...</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        {activeSprint && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 10, backgroundColor: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#00d4aa" }} />
            <span style={{ fontSize: 12, color: "#00d4aa", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
              {activeSprint.name} · {activeSprint.tasks?.length || 0} tasks
            </span>
            <button onClick={loadSprint} style={{ background: "none", border: "none", cursor: "pointer", color: "#00d4aa" }}>
              <FiRefreshCw size={12} className={loadingSprint ? "animate-spin" : ""} />
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <FiLock size={12} style={{ color: "#ef4444" }} />
          <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>= Blocked by dependency</span>
        </div>
      </div>

      {/* No project selected */}
      {!selectedProject && (
        <div className="text-center py-16">
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏃</p>
          <p style={{ color: text, fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700 }}>Select a project to start</p>
          <p style={{ color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 13, marginTop: 4 }}>
            A sprint will be automatically created and saved to the database
          </p>
        </div>
      )}

      {loadingSprint && (
        <div className="text-center py-8">
          <p style={{ color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>Loading sprint from database...</p>
        </div>
      )}

      {/* Kanban board */}
      {selectedProject && !loadingSprint && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COL_ORDER.map(colId => {
              const col = columns[colId];
              return (
                <div key={colId} className="shrink-0 w-64 rounded-2xl flex flex-col"
                  style={{ backgroundColor: colBg, border: `1px solid ${border}`, minHeight: "500px" }}>

                  {/* Header */}
                  <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="text-sm font-bold" style={{ color: text, fontFamily: "Syne, sans-serif" }}>{col.title}</h3>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${col.color}20`, color: col.color }}>
                        {col.tasks.length}
                      </span>
                    </div>
                    <button onClick={() => setAddingTo(addingTo === colId ? null : colId)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${col.color}20`, color: col.color, border: "none", cursor: "pointer" }}>
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {/* Add Task Form */}
                  {addingTo === colId && (
                    <div className="mx-3 mb-2 p-3 rounded-xl"
                      style={{ backgroundColor: cardBg, border: `1px solid ${col.color}40`, animation: "slideUp 0.2s ease" }}>
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
                      <select value={newTask.dependsOn} onChange={e => setNewTask({ ...newTask, dependsOn: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg outline-none text-xs mb-2"
                        style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "DM Sans, sans-serif" }}>
                        <option value="">No dependency</option>
                        {projectTasks.map(t => (
                          <option key={t.id} value={t.id}>🔗 {t.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => addTask(colId)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: col.color, color: "white", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                          Add to Sprint
                        </button>
                        <button onClick={() => setAddingTo(null)}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ backgroundColor: isDark ? "#1e1e30" : "#f1f5f9", color: muted, border: "none", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Task Cards */}
                  <Droppable droppableId={colId}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className="flex-1 px-3 pb-3 space-y-2 min-h-24"
                        style={{ backgroundColor: snapshot.isDraggingOver ? `${col.color}08` : "transparent" }}>

                        {col.tasks.map((task, index) => {
                          const pc       = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
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
                                    <div {...provided.dragHandleProps} className="mt-0.5 opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing">
                                      <MdDragIndicator size={14} style={{ color: muted }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
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
                                      {task.subtasks?.length > 0 && (
                                        <div style={{ marginTop: 4 }}>
                                          <span style={{ fontSize: 9, color: "#6c63ff", fontFamily: "DM Sans, sans-serif" }}>✓ {doneSubs}/{task.subtasks.length} subs</span>
                                          <div style={{ height: 2, borderRadius: 2, backgroundColor: isDark ? "#1e1e30" : "#e2e8f0", overflow: "hidden", marginTop: 2 }}>
                                            <div style={{ height: "100%", width: `${task.subtasks.length > 0 ? Math.round((doneSubs / task.subtasks.length) * 100) : 0}%`, background: "linear-gradient(90deg, #6c63ff, #a78bfa)", borderRadius: 2 }} />
                                          </div>
                                        </div>
                                      )}
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

                        {col.tasks.length === 0 && !addingTo && (
                          <div style={{ textAlign: "center", padding: "20px 0", color: muted }}>
                            <p style={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}>No tasks</p>
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
      )}

      <style>{`@keyframes slideUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </PageWrapper>
  );
};

export default SprintBoard;