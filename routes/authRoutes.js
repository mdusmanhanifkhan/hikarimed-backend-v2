import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getMe,
  getSingleUser,
  loginUser,
  updateUser,
  updateUserRole,
} from "../controller/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

// ✅ /me route - protected
router.get("/me", protect, getMe);

router.get("/users", protect, getAllUsers);
router.get("/user/:id", protect, getSingleUser);
router.get("/user/:id", protect, updateUser);
router.get("/user/:id", protect, updateUserRole);
router.delete("/user/:id", protect, deleteUser);

export default router;
