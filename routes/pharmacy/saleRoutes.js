import express from "express";
import { createSale, createSaleReturn, getAllSales, getSaleById } from "../../controller/pharmacy/SaleController.js";


const router = express.Router();

router.post("/sale", createSale);
router.get("/sale/:id", getSaleById);
router.get("/sale", getAllSales);
router.post("/sale-returns", createSaleReturn);

export default router;
