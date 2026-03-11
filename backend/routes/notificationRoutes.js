import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/mark-all-read", protect, markAllAsRead);  // must be before /:id
router.patch("/:id/read", protect, markAsRead);
router.delete("/", protect, clearAllNotifications);       // clear all
router.delete("/:id", protect, deleteNotification);

export default router;