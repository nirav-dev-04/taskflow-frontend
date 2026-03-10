import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";

export const getTasks = asyncHandler(async (req, res) => {
  const { project, status, assignedTo } = req.query;
  const filter = {};
  if (req.user.role === "employee") filter.assignedTo = req.user._id;
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("project", "name status")
    .sort({ createdAt: -1 });
  res.json({ tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email avatar")
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
  const { title, description, status, priority, project, assignedTo, dueDate } =
    req.body;
  const task = await Task.create({
    title,
    description,
    status,
    priority,
    project,
    assignedTo,
    dueDate,
    createdBy: req.user._id,
  });
  await task.populate([
    { path: "assignedTo", select: "name email avatar" },
    { path: "project", select: "name" },
  ]);

  if (assignedTo && assignedTo !== req.user._id.toString()) {
    await Notification.create({
      recipient: assignedTo,
      sender: req.user._id,
      type: "task_assigned",
      message: `You have been assigned to task "${title}"`,
      link: "/employee/tasks",
    });
    getIO()
      ?.to(`user:${assignedTo}`)
      .emit("notification", { message: `New task assigned: ${title}` });
  }

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
    "assignedTo",
    "dueDate",
    "progress",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });
  await task.save();
  await task.populate([
    { path: "assignedTo", select: "name email avatar" },
    { path: "project", select: "name" },
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
  await task.deleteOne();
  await updateProjectProgress(task.project);
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
  if (status === "completed") task.progress = 100;
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
  res.status(201).json({ comment: task.comments[task.comments.length - 1] });
});

async function updateProjectProgress(projectId) {
  const total = await Task.countDocuments({ project: projectId });
  const completed = await Task.countDocuments({
    project: projectId,
    status: "completed",
  });
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  await Project.findByIdAndUpdate(projectId, { progress });
}
