import express from "express";
import { protect, adminOrManager } from "../middleware/authMiddleware.js";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  // Subtasks
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  // Time Tracking
  logTime,
  getTimeLog,
  // Activity Log
  getActivityLog,
} from "../controllers/taskController.js";

const router = express.Router();

// ── Core CRUD ─────────────────────────────────────────────────────────────────
router.get("/",           protect, getTasks);
router.post("/",          protect, adminOrManager, createTask);
router.get("/:id",        protect, getTaskById);
router.put("/:id",        protect, updateTask);
router.delete("/:id",     protect, adminOrManager, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);

// ── Comments ──────────────────────────────────────────────────────────────────
router.post("/:id/comments", protect, addComment);

// ── Subtasks ──────────────────────────────────────────────────────────────────
router.post("/:id/subtasks",                    protect, adminOrManager, addSubtask);
router.patch("/:id/subtasks/:subtaskId/toggle", protect, toggleSubtask);
router.delete("/:id/subtasks/:subtaskId",       protect, adminOrManager, deleteSubtask);

// ── Time Tracking ─────────────────────────────────────────────────────────────
router.post("/:id/time",  protect, logTime);
router.get("/:id/time",   protect, getTimeLog);

// ── Activity Log ──────────────────────────────────────────────────────────────
router.get("/:id/activity", protect, getActivityLog);

export default router;