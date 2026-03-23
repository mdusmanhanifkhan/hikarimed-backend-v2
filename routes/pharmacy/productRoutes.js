import express from "express";
import { createProduct, getProducts } from "../../controller/pharmacy/ProductController.js";


const router = express.Router();

router.post("/product", createProduct);
router.get("/product", getProducts);

export default router;
