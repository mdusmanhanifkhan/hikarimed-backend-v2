import express from "express"
import { createRole, getRoleById, getRoles } from "../controller/roleController.js"

const router = express.Router()

// Only admin can create roles
router.post("/role", createRole)
router.get("/role", getRoles)
router.get("/role/:id", getRoleById)

export default router
