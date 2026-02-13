import express from "express";
import {
  createCategory,
  getCategories,
} from "../../controller/pharmacy/MedicineCategoryController.js";

const router = express.Router();

router.post("/medicine-category", createCategory);
router.get("/medicine-category", getCategories);

export default router;
