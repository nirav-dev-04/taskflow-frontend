import express from "express";
import { protect, adminOrManager } from "../middleware/authMiddleware.js";
import {
  getSprints,
  getSprintById,
  createSprint,
  addTaskToSprint,
  removeTaskFromSprint,
  updateSprint,
  deleteSprint,
  getOrCreateActiveSprint,
} from "../controllers/sprintController.js";

const router = express.Router();

// GET  /api/sprints              — list all sprints (filter by ?project=id)
// GET  /api/sprints/active       — get or auto-create active sprint for a project
// POST /api/sprints              — create sprint
// GET  /api/sprints/:id          — get single sprint
// PUT  /api/sprints/:id          — update sprint
// DELETE /api/sprints/:id        — delete sprint
// POST /api/sprints/:id/tasks    — add task to sprint
// DELETE /api/sprints/:id/tasks/:taskId — remove task from sprint

router.get("/active", protect, adminOrManager, getOrCreateActiveSprint);
router.get("/",       protect, adminOrManager, getSprints);
router.post("/",      protect, adminOrManager, createSprint);
router.get("/:id",    protect, adminOrManager, getSprintById);
router.put("/:id",    protect, adminOrManager, updateSprint);
router.delete("/:id", protect, adminOrManager, deleteSprint);
router.post("/:id/tasks",              protect, adminOrManager, addTaskToSprint);
router.delete("/:id/tasks/:taskId",    protect, adminOrManager, removeTaskFromSprint);

export default router;