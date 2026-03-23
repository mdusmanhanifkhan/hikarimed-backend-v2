import express from "express";
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../../controller/pharmacy/SupplierController.js";


const router = express.Router();

router.post("/supplier", createSupplier);
router.get("/supplier", getAllSuppliers);
router.get("/supplier/:id", getSupplierById);
router.put("/supplier/:id", updateSupplier);
router.delete("/supplier/:id", deleteSupplier);

export default router;
