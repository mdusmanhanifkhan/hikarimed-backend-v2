import express from "express";
import {
  createRole,
  listRoles,
  updateRole,
  deleteRole,
  getRoleById,
} from "../controller/roleController.js";

const router = express.Router();

router.post("/roles", createRole);
router.get("/roles", listRoles);
router.get("/roles/:id", getRoleById);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

export default router;