import express from "express";
import { protect, adminOrManager } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, adminOrManager, createProject);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, adminOrManager, updateProject);
router.delete("/:id", protect, adminOrManager, deleteProject);
router.post("/:id/members", protect, adminOrManager, addMember);
router.delete("/:id/members/:userId", protect, adminOrManager, removeMember);

export default router;
