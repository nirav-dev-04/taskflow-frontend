import asyncHandler from "express-async-handler";
import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";

// ── GET all sprints for manager's projects ────────────────────────────────────
export const getSprints = asyncHandler(async (req, res) => {
  const { project } = req.query;
  const filter = { manager: req.user._id };
  if (project) filter.project = project;

  const sprints = await Sprint.find(filter)
    .populate("project", "name")
    .populate("manager", "name avatar")
    .populate({
      path: "tasks",
      populate: [
        { path: "assignees", select: "name avatar" },
        { path: "project", select: "name" },
      ],
    })
    .sort({ createdAt: -1 });

  res.json({ sprints });
});

// ── GET single sprint ─────────────────────────────────────────────────────────
export const getSprintById = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id)
    .populate("project", "name")
    .populate("manager", "name avatar")
    .populate({
      path: "tasks",
      populate: { path: "assignees", select: "name avatar" },
    });

  if (!sprint) {
    res.status(404);
    throw new Error("Sprint not found");
  }
  res.json({ sprint });
});

// ── CREATE sprint (auto-creates one per project if none active) ───────────────
export const createSprint = asyncHandler(async (req, res) => {
  const { project, name, goal, endDate } = req.body;

  if (!project) {
    res.status(400);
    throw new Error("Project is required");
  }

  // Check if active sprint already exists for this project
  let sprint = await Sprint.findOne({ project, manager: req.user._id, status: "active" });

  if (!sprint) {
    const sprintNumber = (await Sprint.countDocuments({ project })) + 1;
    sprint = await Sprint.create({
      name: name || `Sprint ${sprintNumber}`,
      project,
      manager: req.user._id,
      goal: goal || "",
      endDate: endDate || null,
      status: "active",
    });
  }

  await sprint.populate("project", "name");
  res.status(201).json({ sprint });
});

// ── ADD task to sprint ────────────────────────────────────────────────────────
export const addTaskToSprint = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    res.status(404);
    throw new Error("Sprint not found");
  }

  if (!sprint.tasks.includes(taskId)) {
    sprint.tasks.push(taskId);
    await sprint.save();
  }

  await sprint.populate({
    path: "tasks",
    populate: { path: "assignees", select: "name avatar" },
  });

  res.json({ sprint });
});

// ── REMOVE task from sprint ───────────────────────────────────────────────────
export const removeTaskFromSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    res.status(404);
    throw new Error("Sprint not found");
  }

  sprint.tasks = sprint.tasks.filter(t => t.toString() !== req.params.taskId);
  await sprint.save();
  res.json({ sprint });
});

// ── UPDATE sprint (status, name, goal) ───────────────────────────────────────
export const updateSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    res.status(404);
    throw new Error("Sprint not found");
  }

  const { name, status, goal, endDate } = req.body;
  if (name)    sprint.name    = name;
  if (status)  sprint.status  = status;
  if (goal)    sprint.goal    = goal;
  if (endDate) sprint.endDate = endDate;

  await sprint.save();
  res.json({ sprint });
});

// ── DELETE sprint ─────────────────────────────────────────────────────────────
export const deleteSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    res.status(404);
    throw new Error("Sprint not found");
  }

  await sprint.deleteOne();
  res.json({ message: "Sprint deleted" });
});

// ── GET or AUTO-CREATE active sprint for a project ────────────────────────────
export const getOrCreateActiveSprint = asyncHandler(async (req, res) => {
  const { project } = req.query;

  if (!project) {
    res.status(400);
    throw new Error("Project required");
  }

  let sprint = await Sprint.findOne({ project, manager: req.user._id, status: "active" })
    .populate({
      path: "tasks",
      populate: [
        { path: "assignees", select: "name avatar" },
        { path: "project", select: "name" },
      ],
    });

  if (!sprint) {
    const sprintNumber = (await Sprint.countDocuments({ project })) + 1;
    sprint = await Sprint.create({
      name: `Sprint ${sprintNumber}`,
      project,
      manager: req.user._id,
      status: "active",
    });
    await sprint.populate({
      path: "tasks",
      populate: { path: "assignees", select: "name avatar" },
    });
  }

  res.json({ sprint });
});