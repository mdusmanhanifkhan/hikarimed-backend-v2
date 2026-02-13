import express from "express";
import { createMedicine, getMedicines } from "../../controller/pharmacy/MedicineController.js";


const router = express.Router();

router.post("/medicine", createMedicine);
router.get("/medicine", getMedicines);

export default router;
