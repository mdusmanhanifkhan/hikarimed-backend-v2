import express from "express";
import { approveIndent, createIndent, deleteIndent, getAllIndents, getAllIndentWithPagination, getIndentById } from "../../controller/pharmacy/IndentController.js";


const router = express.Router();

// Base path: /generic-name
router.post("/indent", createIndent);
router.get("/indent", getAllIndents);
router.get("/indent-pagi", getAllIndentWithPagination);

// Dynamic routes for specific generic names by ID
router.get("/indent/:id", getIndentById);
router.get("/indent-approved", approveIndent );
router.delete("/indent/:id", deleteIndent);

export default router;
