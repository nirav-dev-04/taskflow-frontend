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
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, adminOrManager, createTask);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOrManager, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);
router.post("/:id/comments", protect, addComment);

export default router;
