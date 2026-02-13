import express from "express";
import { createGRN, getGRNById, getStockList } from "../../controller/pharmacy/GrnController.js";


const router = express.Router();

router.post("/grn", createGRN);
router.get("/grn", getGRNById);
router.get("/stock-list", getStockList);

export default router;
