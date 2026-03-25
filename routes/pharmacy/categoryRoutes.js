import express from "express";
import {
  createCategory,
  createSubcategory,
  getCategories,
  getCategoryTree,
} from "../../controller/pharmacy/CategoryController.js";

const router = express.Router();

router.post("/category", createCategory);
router.post("/sub-category", createSubcategory);
router.get("/category", getCategories);
router.get("/sub-category", getCategoryTree);

export default router;
