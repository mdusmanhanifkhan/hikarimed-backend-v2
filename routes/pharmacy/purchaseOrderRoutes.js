import express from "express";
import {
  createPO,
  getAllPOs,
  getPOById,
  updatePOStatus,
  approvePO,
  recordPayment,
  getApprovedPOs,
} from "../../controller/pharmacy/PurchaseOrderController.js";

const router = express.Router();

// -------------------------
// Purchase Order Routes
// -------------------------
router.get("/get-all-pos", getAllPOs);          
router.get("/po/:id", getPOById);              
router.post("/create-po", createPO);          
router.get("/po-status", getApprovedPOs);          
router.put("/po/:id/status", updatePOStatus);  
router.put("/po/:id/approve", approvePO);      
router.post("/po/:id/payment", recordPayment); 

export default router;
