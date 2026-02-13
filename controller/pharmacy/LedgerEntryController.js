// Adjust path according to your project

import { prisma } from "../../lib/prisma.js";

// -------------------------
// CREATE LEDGER ENTRY
// -------------------------
const paymentStatusOptions = [
  { id: "FULL_AFTER_RECEIVE", name: "Full payment after receiving goods" },
  { id: "ADVANCE", name: "Advance payment before delivery" },
  {
    id: "PARTIAL_50_AFTER_RECEIVE",
    name: "50% payment now, 50% after receiving goods",
  },
  { id: "WITHIN_30_DAYS", name: "Payment within 30 days of delivery" },
];

export const createLedgerEntry = async (req, res) => {
  try {
    const {
      refType,
      refId,
      debit = 0,
      credit = 0,
      accountType,
      accountRefId,
      remarks,
      paymentStatus, 
    } = req.body;

    const userId = req.user && req.user.id;

    // ✅ Validate required fields
    if (!refType || !refId || !accountType || !paymentStatus) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ Validate paymentStatus is allowed
   const statusOption = paymentStatusOptions.find(
  (opt) => opt.id === paymentStatus || opt.name === paymentStatus
);

    if (!statusOption) {
      return res.status(400).json({ message: "Invalid paymentStatus value" });
    }

    // 1️⃣ Create the ledger entry
    const entry = await prisma.ledgerEntry.create({
      data: {
        refType,
        refId: Number(refId),
        debit,
        credit,
        accountType,
        accountRefId: accountRefId || null,
        approvedBy: userId || null,
        approvedAt: new Date(),
        userId: userId || null,
        remarks: remarks || "",
        paymentStatus, // store raw value
      },
      include: {
        approver: true,
        user: true,
      },
    });

    // 2️⃣ Update the PurchaseOrder status if this is a PO payment
    if (refType === "PO") {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: Number(refId) },
        include: { payments: true },
      });

      if (!po) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }

      // Use human-readable status from paymentStatusOptions
      await prisma.purchaseOrder.update({
        where: { id: Number(refId) },
        data: { status: statusOption.name },
      });
    }

    return res.status(201).json({ message: "Ledger entry created", entry });
  } catch (error) {
    console.error("createLedgerEntry error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// GET ALL LEDGER ENTRIES
// -------------------------
export const getLedgerEntries = async (req, res) => {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      include: {
        approver: true,
        user: true,
      },
      orderBy: { entryDate: "desc" },
    });

    return res.json({ data: entries });
  } catch (error) {
    console.error("getLedgerEntries error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// GET SINGLE LEDGER ENTRY
// -------------------------
export const getLedgerEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.ledgerEntry.findUnique({
      where: { id: Number(id) },
      include: {
        approver: true,
        user: true,
      },
    });

    if (!entry)
      return res.status(404).json({ message: "Ledger entry not found" });

    return res.json({ data: entry });
  } catch (error) {
    console.error("getLedgerEntryById error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
