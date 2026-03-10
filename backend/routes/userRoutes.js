import express from "express";
import {
  protect,
  adminOnly,
  adminOrManager,
} from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, adminOrManager, getAllUsers);
router.post("/", protect, adminOnly, createUser);
router.get("/:id", protect, adminOrManager, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);
router.patch("/:id/activate", protect, adminOnly, toggleUserStatus);

export default router;
