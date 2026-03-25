import { prisma } from "../../lib/prisma.js";
import {
  buildPaginationResponse,
  getPagination,
} from "../../utils/pagination.js";
import { PurchaseOrderPdfGenerator } from "../../utils/PurchaseOrderPdfGenerator.js";

const POStatus = {
  DRAFT: "DRAFT",
  FOR_APPROVAL: "FOR_APPROVAL",
  APPROVED: "APPROVED",
  SENT_TO_SUPPLIER: "SENT_TO_SUPPLIER",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
};

// -------------------------
// GET all POs with pagination
// -------------------------
const getAllPOs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await prisma.purchaseOrder.count();

    const pos = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        receipts: true,
        payments: true,
      },
      orderBy: { poDate: "desc" },
      skip,
      take: limit,
    });

    const pagination = buildPaginationResponse(total, page, limit, pos.length);
    return res.json({ data: pos, pagination });
  } catch (error) {
    console.error("getAllPOs error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// GET single PO by ID
// -------------------------
const getPOById = async (req, res) => {
  try {
    const { id } = req.params;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        receipts: true,
        payments: true,
      },
    });

    if (!po)
      return res.status(404).json({ message: "Purchase Order not found" });
    return res.json(po);
  } catch (error) {
    console.error("getPOById error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// CREATE a new PO
// -------------------------
const generatePONo = async () => {
  const count = await prisma.purchaseOrder.count();
  return `PO-${(count + 1).toString().padStart(5, "0")}`;
};

const createPO = async (req, res) => {
  try {
    let { poNo, supplierId, prId, remarks, paymentType, items } = req.body;
    const userId = req.user?.id; // logged in user

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    if (!poNo) poNo = await generatePONo();
    if (!supplierId || !prId || !items?.length) {
      return res.status(400).json({ message: "Missing data" });
    }

    // 1️⃣ Check if any item is already PO created
    const existingItemIds = await prisma.indenItem.findMany({
      where: {
        id: { in: items.map((i) => Number(i.indentItemId)) },
        isPoCreated: true,
      },
      select: { id: true },
    });

    if (existingItemIds.length > 0) {
      return res.status(400).json({
        message: `Some items are already included in another PO`,
        existingItemIds: existingItemIds.map((i) => i.id),
      });
    }

    // 2️⃣ Calculate total amount
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.totalAmount),
      0,
    );

    // 3️⃣ Transaction to create PO and update indent items
    const po = await prisma.$transaction(async (tx) => {
      // Create Purchase Order
      const po = await tx.purchaseOrder.create({
        data: {
          poNo,
          pr: { connect: { id: Number(prId) } },
          remarks,
          status: "DRAFT",
          totalAmount,
          netAmount: totalAmount,
          supplier: { connect: { id: Number(supplierId) } },
          createdBy: { connect: { id: Number(userId) } },
          items: {
            create: items.map((i) => ({
              productId: Number(i.productId),
              variantId: i.variantId ? Number(i.variantId) : null,
              orderedQty: Number(i.orderedQty),
              rate: Number(i.rate),
              discountPercent: Number(i.discountPercent || 0),
              taxPercent: Number(i.taxPercent || 0),
              totalAmount: Number(i.totalAmount),
            })),
          },
        },
        include: { items: true },
      });

      // Mark indent items as PO created
      await tx.indenItem.updateMany({
        where: { id: { in: items.map((i) => Number(i.indentItemId)) } },
        data: { isPoCreated: true },
      });

      // Update Indent status
      const remaining = await tx.indenItem.count({
        where: { indentId: Number(prId), isPoCreated: false },
      });

      await tx.indent.update({
        where: { id: Number(prId) },
        data: { status: remaining === 0 ? "PO_CREATED" : "PARTIAL" },
      });

      return po;
    });

    return res.status(201).json({ message: "PO created successfully", po });
  } catch (error) {
    console.error("createPO error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// -------------------------
// APPROVE PO
// -------------------------
const approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, status } = req.body; // receive status from frontend
    const approvedBy = req.user.id;

    if (!approvedBy)
      return res.status(400).json({ message: "Approver ID required" });

    if (!status) return res.status(400).json({ message: "Status is required" });

    const validStatuses = [
      "DRAFT",
      "FOR_APPROVAL",
      "APPROVED",
      "SENT_TO_SUPPLIER",
      "PARTIALLY_RECEIVED",
      "RECEIVED",
      "CLOSED",
      "CANCELLED",
      "PARTIAL",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    } // define allowed statuses
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status provided" });

    // Fetch current PO
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true, variant: true } },
        supplier: true,
      },
    });

    if (!po) return res.status(404).json({ message: "PO not found" });

    // Prevent approving invalid POs
    if (po.status === "CANCELLED")
      return res.status(400).json({ message: "Cannot approve a cancelled PO" });

    if (po.status === "APPROVED" && status === "APPROVED")
      return res.status(400).json({ message: "PO is already approved" });

    if (po.status === "CLOSED")
      return res.status(400).json({ message: "Cannot modify a closed PO" });

    // Update PO with frontend status
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: {
        status, // use status from frontend
        approvedBy,
        approvedAt: status === "APPROVED" ? new Date() : null, // record approval only if approved
        remarks: remarks || po.remarks || "",
      },
      include: {
        items: { include: { product: true, variant: true } },
        supplier: true,
      },
    });

    // Generate PDF only if status is approved and not already generated
    let pdfUrl = updatedPO.pdfUrl;
    if (status === "APPROVED" && !pdfUrl) {
      pdfUrl = await PurchaseOrderPdfGenerator(updatedPO);
      await prisma.purchaseOrder.update({
        where: { id: Number(id) },
        data: { pdfUrl, pdfGeneratedAt: new Date() },
      });
    }

    return res.json({
      message: `PO ${status.toLowerCase()}${status === "APPROVED" ? " & PDF generated" : ""}`,
      po: { ...updatedPO, pdfUrl },
    });
  } catch (error) {
    console.error("approvePO error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
// -------------------------
// RECORD PAYMENT
// -------------------------
const recordPaymentLogic = async (po, paidAmount) => {
  const newPaidAmount = (po.paidAmount || 0) + paidAmount;
  const newPaymentStatus =
    newPaidAmount >= po.netAmount ? "PAID" : "PARTIALLY_PAID";

  const updatedPO = await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
      status:
        newPaymentStatus === "PAID"
          ? POStatus.CLOSED
          : POStatus.PARTIALLY_RECEIVED,
    },
    include: { items: true, supplier: true },
  });

  // Optional: regenerate PDF with payment slip
  // const pdfUrl = await generatePOPDF(updatedPO);
  // await prisma.purchaseOrder.update({ where: { id: po.id }, data: { pdfFileUrl: pdfUrl } });

  return updatedPO;
};

const recordPayment = async (req, res) => {
  try {
    const { poId, paidAmount } = req.body;
    if (!poId || !paidAmount)
      return res
        .status(400)
        .json({ message: "PO ID and paid amount required" });

    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) return res.status(404).json({ message: "PO not found" });

    if (![POStatus.APPROVED, POStatus.PARTIALLY_RECEIVED].includes(po.status)) {
      return res.status(400).json({ message: "Only approved PO can be paid." });
    }

    const updatedPO = await recordPaymentLogic(po, paidAmount);
    return res.json({
      message: "Payment recorded successfully",
      po: updatedPO,
    });
  } catch (error) {
    console.error("recordPayment error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// UPDATE PO STATUS manually
// -------------------------
const updatePOStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    const po = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: {
        status,
        approvedBy: approvedBy || null,
        approvedAt: approvedBy ? new Date() : null,
      },
    });

    return res.json(po);
  } catch (error) {
    console.error("updatePOStatus error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// -------------------------
// GET Approved POs
// -------------------------
const getApprovedPOs = async (req, res) => {
  try {
    const approvedPOs = await prisma.purchaseOrder.findMany({
      where: {
        status: {
          in: [
            POStatus.APPROVED,
            POStatus.SENT_TO_SUPPLIER,
            POStatus.PARTIALLY_RECEIVED,
            POStatus.RECEIVED,
            POStatus.CLOSED,
          ],
        },
      },
      include: {
        items: { include: { product: true, variant: true } },
        supplier: true,
      },
      orderBy: { approvedAt: "desc" },
    });

    return res.json({ data: approvedPOs });
  } catch (error) {
    console.error("getApprovedPOs error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export {
  getAllPOs,
  getPOById,
  createPO,
  approvePO,
  recordPayment,
  updatePOStatus,
  getApprovedPOs,
};
