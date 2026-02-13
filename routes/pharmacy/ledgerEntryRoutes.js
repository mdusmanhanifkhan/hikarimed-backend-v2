import express from "express";
import { createLedgerEntry, getLedgerEntries, getLedgerEntryById } from "../../controller/pharmacy/LedgerEntryController.js";


const router = express.Router();

// Base path: /generic-name
router.post("/ledger-entry", createLedgerEntry);
router.get("/ledger-entry", getLedgerEntries);
router.get("/ledger-entry/:id", getLedgerEntryById);


export default router;
