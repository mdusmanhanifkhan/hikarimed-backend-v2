import express from "express";
import {
  createPermission,
  listPermissions,
  getPermission,
  updatePermission,
  deletePermission,
} from "../controller/permissionController.js";

const router = express.Router();

router.post("/permissions", createPermission);
router.get("/permissions", listPermissions);
router.get("/permissions/:id", getPermission);
router.put("/permissions/:id", updatePermission);
router.delete("/permissions/:id", deletePermission);

export default router;