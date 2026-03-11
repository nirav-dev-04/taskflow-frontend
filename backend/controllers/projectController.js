import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { getIO } from "../socket/socketHandler.js";

export const getProjects = asyncHandler(async (req, res) => {
  const filter = {};

  // Employees only see projects they are a member of
  if (req.user.role === "employee") filter.members = req.user._id;
  // Managers see projects they manage or are a member of
  if (req.user.role === "manager")
    filter.$or = [{ manager: req.user._id }, { members: req.user._id }];

  const projects = await Project.find(filter)
    .populate("manager", "name email avatar")
    .populate("members", "name email avatar")
    .sort({ createdAt: -1 });

  res.json({ projects });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("manager", "name email avatar")
    .populate("members", "name email avatar");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, priority, dueDate, members, manager } =
    req.body;

  const project = await Project.create({
    name,
    description,
    status: status || "planning",
    priority: priority || "medium",
    dueDate,
    manager: req.user.role === "admin" ? manager || req.user._id : req.user._id,
    members: members || [],
    createdBy: req.user._id,
  });

  await project.populate([
    { path: "manager", select: "name email avatar" },
    { path: "members", select: "name email avatar" },
  ]);

  getIO()?.emit("project:created", { project });
  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const fields = ["name", "description", "status", "priority", "dueDate", "progress"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) project[f] = req.body[f];
  });

  await project.save();
  await project.populate([
    { path: "manager", select: "name email avatar" },
    { path: "members", select: "name email avatar" },
  ]);

  getIO()?.to(`project:${project._id}`).emit("project:updated", { project });
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  getIO()?.emit("project:deleted", { projectId: req.params.id });
  res.json({ message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const already = project.members.some((m) => m.toString() === userId);
  if (already) {
    res.status(400);
    throw new Error("Already a member");
  }

  project.members.push(userId);
  await project.save();
  await project.populate("members", "name email avatar");

  getIO()
    ?.to(`project:${project._id}`)
    .emit("project:member_added", { projectId: project._id, userId });

  res.json({ project });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId,
  );
  await project.save();
  await project.populate("members", "name email avatar");

  getIO()
    ?.to(`project:${project._id}`)
    .emit("project:member_removed", { projectId: project._id, userId: req.params.userId });

  res.json({ project });
});