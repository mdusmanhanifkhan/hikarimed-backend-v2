import express from "express";
import { createMedicine, getMedicines } from "../../controller/pharmacy/medicineController.js";


const router = express.Router();

router.post("/medicine", createMedicine);
router.get("/medicine", getMedicines);

export default router;
