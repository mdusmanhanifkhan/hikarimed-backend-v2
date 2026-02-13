import express from "express";
import { 
  createGenericName, 
  getGenericNames, 
  getGenericNameById, 
  updateGenericName, 
  deleteGenericName 
} from "../../controller/pharmacy/GenericNameController.js";

const router = express.Router();

// Base path: /generic-name
router.post("/generic-name", createGenericName);
router.get("/generic-name", getGenericNames);

// Dynamic routes for specific generic names by ID
router.get("/generic-name/:id", getGenericNameById);
router.put("/generic-name/:id", updateGenericName);
router.delete("/generic-name/:id", deleteGenericName);

export default router;
