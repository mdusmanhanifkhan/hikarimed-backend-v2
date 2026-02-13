import express from "express";
import { createSale, getAllSales, getSaleById } from "../../controller/pharmacy/SaleController.js";


const router = express.Router();

router.post("/sale", createSale);
router.get("/sale/:id", getSaleById);
router.get("/sale", getAllSales);

export default router;
