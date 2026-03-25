import express from "express";
import { createGRN, getGRNById, getNextGRNNo, getStockList, getStockListForSale } from "../../controller/pharmacy/GrnController.js";


const router = express.Router();

router.post("/grn", createGRN);
router.get("/grn", getGRNById);
router.get("/stock-list", getStockList);
router.get("/stock-list-for-sale", getStockListForSale);
router.get("/grn/next-grn-no", getNextGRNNo);

export default router;
