import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";

export const getTasks = asyncHandler(async (req, res) => {
  const { project, status, assignee } = req.query;
  const filter = {};

  // Employees only see tasks they are assigned to
  if (req.user.role === "employee") filter.assignees = req.user._id;
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (assignee) filter.assignees = assignee;

  const tasks = await Task.find(filter)
    .populate("assignees", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("project", "name status")
    .sort({ createdAt: -1 });

  res.json({ tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignees", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("project", "name")
    .populate("comments.user", "name avatar");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ task });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, project, assignees, dueDate } =
    req.body;

  const task = await Task.create({
    title,
    description,
    status: status || "todo",
    priority: priority || "medium",
    project,
    assignees: assignees || [],
    dueDate,
    createdBy: req.user._id,
  });

  await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "createdBy", select: "name email avatar" },
  ]);

  // Notify each assignee
  if (assignees?.length) {
    for (const userId of assignees) {
      if (userId !== req.user._id.toString()) {
        await Notification.create({
          recipient: userId,
          sender: req.user._id,
          type: "task_assigned",
          message: `You have been assigned to task "${title}"`,
          link: "/employee/tasks",
        });
        getIO()
          ?.to(`user:${userId}`)
          .emit("notification", {
            message: `New task assigned: ${title}`,
            type: "task_assigned",
          });
      }
    }
  }

  // Emit to project room
  getIO()?.to(`project:${project}`).emit("task:created", { task });

  await updateProjectProgress(project);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const fields = [
    "title",
    "description",
    "status",
    "priority",
    "assignees",
    "dueDate",
    "progress",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });

  await task.save();
  await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "project", select: "name" },
    { path: "createdBy", select: "name email avatar" },
  ]);

  getIO()?.to(`project:${task.project}`).emit("task:updated", { task });
  await updateProjectProgress(task.project);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const projectId = task.project;
  getIO()
    ?.to(`project:${projectId}`)
    .emit("task:deleted", { taskId: task._id });

  await task.deleteOne();
  await updateProjectProgress(projectId);
  res.json({ message: "Task deleted" });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.status = status;
  if (status === "done") task.progress = 100;
  await task.save();

  getIO()
    ?.to(`project:${task.project}`)
    .emit("task:status_changed", { taskId: task._id, status });

  await updateProjectProgress(task.project);
  res.json({ task });
});

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.comments.push({ user: req.user._id, text });
  await task.save();
  await task.populate("comments.user", "name avatar");

  const comment = task.comments[task.comments.length - 1];
  getIO()
    ?.to(`project:${task.project}`)
    .emit("task:comment_added", { taskId: task._id, comment });

  res.status(201).json({ comment });
});

// ── Helper ────────────────────────────────────────────────────────────────────
async function updateProjectProgress(projectId) {
  const total = await Task.countDocuments({ project: projectId });
  const done = await Task.countDocuments({ project: projectId, status: "done" });
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  await Project.findByIdAndUpdate(projectId, { progress });
}