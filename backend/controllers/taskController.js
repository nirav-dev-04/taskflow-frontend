import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function updateProjectProgress(projectId) {
  const total = await Task.countDocuments({ project: projectId });
  const done  = await Task.countDocuments({ project: projectId, status: "done" });
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  await Project.findByIdAndUpdate(projectId, { progress });
}

function addLog(task, userId, action, detail) {
  task.activityLog.push({ user: userId, action, detail });
}

// ── Core CRUD ─────────────────────────────────────────────────────────────────

export const getTasks = asyncHandler(async (req, res) => {
  const { project, status, assignee } = req.query;
  const filter = {};
  if (req.user.role === "employee") filter.assignees = req.user._id;
  if (project)  filter.project  = project;
  if (status)   filter.status   = status;
  if (assignee) filter.assignees = assignee;

  const tasks = await Task.find(filter)
    .populate("assignees",          "name email avatar")
    .populate("createdBy",          "name email avatar")
    .populate("project",            "name status")
    .populate("subtasks.assignee",  "name email avatar")
    .populate("activityLog.user",   "name avatar")
    .populate("timeTracking.logs.user", "name avatar")
    .populate("dependencies",       "title status")
    .sort({ createdAt: -1 });

  res.json({ tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignees",           "name email avatar")
    .populate("createdBy",           "name email avatar")
    .populate("project",             "name")
    .populate("comments.user",       "name avatar")
    .populate("comments.mentions",   "name avatar")
    .populate("subtasks.assignee",   "name email avatar")
    .populate("subtasks.completedBy","name avatar")
    .populate("activityLog.user",    "name avatar")
    .populate("timeTracking.logs.user", "name avatar")
    .populate("dependencies",        "title status priority");

  if (!task) { res.status(404); throw new Error("Task not found"); }
  res.json({ task });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, project, assignees, dueDate, dependencies, estimatedHours } = req.body;

  const task = await Task.create({
    title,
    description,
    status:       status || "todo",
    priority:     priority || "medium",
    project,
    assignees:    assignees || [],
    dueDate,
    dependencies: dependencies || [],
    createdBy:    req.user._id,
    timeTracking: { estimated: estimatedHours || 0, logs: [] },
  });

  addLog(task, req.user._id, "created", `Task "${title}" created`);
  await task.save();

  await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "project",   select: "name" },
    { path: "createdBy", select: "name email avatar" },
  ]);

  // Notify each assignee
  if (assignees?.length) {
    for (const userId of assignees) {
      if (userId !== req.user._id.toString()) {
        await Notification.create({
          recipient: userId,
          sender:    req.user._id,
          type:      "task_assigned",
          message:   `You have been assigned to task "${title}"`,
          link:      "/employee/tasks",
        });
        getIO()?.to(`user:${userId}`).emit("notification", {
          message: `New task assigned: ${title}`,
          type:    "task_assigned",
        });
      }
    }
  }

  getIO()?.to(`project:${project}`).emit("task:created", { task });
  await updateProjectProgress(project);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  const fields = ["title", "description", "status", "priority", "assignees", "dueDate", "progress", "dependencies"];
  fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

  if (req.body.estimatedHours !== undefined) task.timeTracking.estimated = req.body.estimatedHours;

  addLog(task, req.user._id, "updated", `Task updated`);
  await task.save();

  await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "project",   select: "name" },
    { path: "createdBy", select: "name email avatar" },
    { path: "subtasks.assignee", select: "name email avatar" },
  ]);

  getIO()?.to(`project:${task.project}`).emit("task:updated", { task });
  await updateProjectProgress(task.project);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  const projectId = task.project;
  getIO()?.to(`project:${projectId}`).emit("task:deleted", { taskId: task._id });
  await task.deleteOne();
  await updateProjectProgress(projectId);
  res.json({ message: "Task deleted" });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  const oldStatus = task.status;
  task.status = status;
  if (status === "done" && task.subtasks.length === 0) task.progress = 100;

  addLog(task, req.user._id, "status_changed", `Status changed from ${oldStatus} to ${status}`);
  await task.save();

  getIO()?.to(`project:${task.project}`).emit("task:status_changed", { taskId: task._id, status });
  await updateProjectProgress(task.project);
  res.json({ task });
});

// ── Comments ──────────────────────────────────────────────────────────────────

export const addComment = asyncHandler(async (req, res) => {
  const { text, mentions } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  task.comments.push({ user: req.user._id, text, mentions: mentions || [] });
  addLog(task, req.user._id, "commented", `Added a comment`);
  await task.save();
  await task.populate("comments.user", "name avatar");
  await task.populate("comments.mentions", "name avatar");

  const comment = task.comments[task.comments.length - 1];
  getIO()?.to(`project:${task.project}`).emit("task:comment_added", { taskId: task._id, comment });

  // Notify mentioned users
  if (mentions?.length) {
    for (const userId of mentions) {
      if (userId !== req.user._id.toString()) {
        await Notification.create({
          recipient: userId,
          sender:    req.user._id,
          type:      "mention",
          message:   `${req.user.name} mentioned you in task "${task.title}"`,
          link:      "/employee/tasks",
        });
        getIO()?.to(`user:${userId}`).emit("notification", {
          message: `You were mentioned in "${task.title}"`,
          type:    "mention",
        });
      }
    }
  }

  res.status(201).json({ comment });
});

// ── Subtasks ──────────────────────────────────────────────────────────────────

export const addSubtask = asyncHandler(async (req, res) => {
  const { title, assignee } = req.body;
  if (!title) { res.status(400); throw new Error("Subtask title required"); }

  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  task.subtasks.push({ title, assignee: assignee || null });
  addLog(task, req.user._id, "subtask_added", `Subtask "${title}" added`);
  task.recalculateProgress();
  await task.save();
  await task.populate("subtasks.assignee", "name email avatar");

  // Notify assignee
  if (assignee && assignee !== req.user._id.toString()) {
    await Notification.create({
      recipient: assignee,
      sender:    req.user._id,
      type:      "task_assigned",
      message:   `You have been assigned subtask "${title}" in task "${task.title}"`,
      link:      "/employee/tasks",
    });
    getIO()?.to(`user:${assignee}`).emit("notification", {
      message: `New subtask assigned: ${title}`,
      type:    "task_assigned",
    });
  }

  getIO()?.to(`project:${task.project}`).emit("task:updated", { task });
  res.status(201).json({ subtasks: task.subtasks, progress: task.progress });
});

export const toggleSubtask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) { res.status(404); throw new Error("Subtask not found"); }

  subtask.isCompleted = !subtask.isCompleted;
  subtask.completedAt = subtask.isCompleted ? new Date() : null;
  subtask.completedBy = subtask.isCompleted ? req.user._id : null;

  addLog(task, req.user._id, "subtask_completed",
    `Subtask "${subtask.title}" marked as ${subtask.isCompleted ? "completed" : "incomplete"}`
  );

  task.recalculateProgress();

  // Auto mark task as done if all subtasks completed
  if (task.subtasks.length > 0 && task.subtasks.every(s => s.isCompleted)) {
    task.status = "done";
    addLog(task, req.user._id, "status_changed", "All subtasks completed — task marked as done");
  }

  await task.save();
  getIO()?.to(`project:${task.project}`).emit("task:updated", { task });
  await updateProjectProgress(task.project);
  res.json({ subtasks: task.subtasks, progress: task.progress, status: task.status });
});

export const deleteSubtask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  task.subtasks = task.subtasks.filter(s => s._id.toString() !== subtaskId);
  addLog(task, req.user._id, "subtask_added", `Subtask deleted`);
  task.recalculateProgress();
  await task.save();

  getIO()?.to(`project:${task.project}`).emit("task:updated", { task });
  res.json({ subtasks: task.subtasks, progress: task.progress });
});

// ── Time Tracking ─────────────────────────────────────────────────────────────

export const logTime = asyncHandler(async (req, res) => {
  const { hours, note } = req.body;
  if (!hours || hours <= 0) { res.status(400); throw new Error("Valid hours required"); }

  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error("Task not found"); }

  task.timeTracking.logs.push({ user: req.user._id, hours, note: note || "" });
  addLog(task, req.user._id, "time_logged", `Logged ${hours}h — ${note || "no note"}`);
  await task.save();
  await task.populate("timeTracking.logs.user", "name avatar");

  res.status(201).json({ timeTracking: task.timeTracking });
});

export const getTimeLog = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("timeTracking.logs.user", "name avatar");
  if (!task) { res.status(404); throw new Error("Task not found"); }

  const totalLogged = task.timeTracking.logs.reduce((sum, l) => sum + l.hours, 0);
  res.json({ timeTracking: task.timeTracking, totalLogged });
});

// ── Activity Log ──────────────────────────────────────────────────────────────

export const getActivityLog = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("activityLog.user", "name avatar");
  if (!task) { res.status(404); throw new Error("Task not found"); }

  res.json({ activityLog: task.activityLog.slice().reverse() }); // newest first
});