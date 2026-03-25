import express from "express";
import {
  createStrengthUnit,
  getStrengthUnits,
  updateStrengthUnit,
  deleteStrengthUnit,
  createPackingType,
  getPackingTypes,
  updatePackingType,
  deletePackingType,
  getSingleStrengthUnit,
  getSinglePackingType,
} from "../../controller/pharmacy/StrengthUnitController.js";

const router = express.Router();

// Strength Unit Routes
router.post("/strength-unit", createStrengthUnit);
router.get("/strength-unit", getStrengthUnits);
router.get("/strength-unit/:id", getSingleStrengthUnit);
router.put("/strength-unit/:id", updateStrengthUnit);
router.delete("/strength-unit/:id", deleteStrengthUnit);

// Packing Type Routes
router.post("/packing-type", createPackingType);
router.get("/packing-type", getPackingTypes);
router.get("/packing-type/:id", getSinglePackingType);
router.put("/packing-type/:id", updatePackingType);
router.delete("/packing-type/:id", deletePackingType);

export default router;