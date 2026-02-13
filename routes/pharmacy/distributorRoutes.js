import express from "express";
import { createDistributor, deleteDistributor, getAllDistributors, getDistributorById, updateDistributor } from "../../controller/pharmacy/DistributorController.js";


const router = express.Router();

router.post("/distributors", createDistributor);
router.get("/distributor", getAllDistributors);
router.get("/distributor/:id", getDistributorById);
router.put("/distributor/:id", updateDistributor);
router.delete("/distributor/:id", deleteDistributor);

export default router;
