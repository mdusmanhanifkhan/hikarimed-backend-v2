import express from "express";
import { createDosageForm, getDosageForms } from "../../controller/pharmacy/DosageFormController.js";


const router = express.Router();

router.post("/dosage-form", createDosageForm);
router.get("/dosage-form", getDosageForms);

export default router;
