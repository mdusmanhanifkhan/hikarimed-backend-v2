import express from "express";
import { createProduct, getProductById, getProducts, updateProduct } from "../../controller/pharmacy/ProductController.js";


const router = express.Router();

router.post("/product", createProduct);
router.get("/product", getProducts);
router.get("/product/:id", getProductById);
router.put("/product/:id", updateProduct);

export default router;
