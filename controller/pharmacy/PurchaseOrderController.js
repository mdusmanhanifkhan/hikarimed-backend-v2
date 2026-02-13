import { prisma } from "../../lib/prisma.js";
import {
  buildPaginationResponse,
  getPagination,
} from "../../utils/pagination.js";
import { PurchaseOrderPdfGenerator } from "../../utils/PurchaseOrderPdfGenerator.js";

// -------------------------
// GET all Purchase Orders with pagination
// -------------------------
const getAllPOs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await prisma.purchaseOrder.count();

    const pos = await prisma.purchaseOrder.findMany({
      include: {
        distributor: true,
        items: { include: { medicine: true } },
        grns: true,
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
        distributor: true,
        items: {
          include: {
            medicine: {
              include: {
                unit: true,
                dosageForm: true,
              },
            },
          },
        },
        grns: true,
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
// Auto-generate PO number like INDENT
const generatePONo = async () => {
  const count = await prisma.purchaseOrder.count();
  return `PO-${(count + 1).toString().padStart(5, "0")}`;
};

// const createPO = async (req, res) => {
//   try {
//     let {
//       poNo,
//       distributorId,
//       companyId,
//       indentId,
//       remarks,
//       items,
//       paymentType,
//     } = req.body;

//     // Auto-generate PO number if not provided
//     if (!poNo) {
//       poNo = await generatePONo();
//     }

//     // Validation
//     if (!poNo) return res.status(400).json({ message: "PO No is required" });
//     if (!distributorId)
//       return res.status(400).json({ message: "Distributor is required" });
//     if (!indentId)
//       return res.status(400).json({ message: "Indent ID is required" });
//     if (!items || items.length === 0)
//       return res.status(400).json({ message: "PO items are required" });
//     if (items.some((item) => !item.medicineId))
//       return res
//         .status(400)
//         .json({ message: "All items must have a medicine selected" });

//     // Calculate total
//     const totalAmount = items.reduce((sum, i) => sum + i.totalAmount, 0);

//     // Build include object dynamically
//     const includeObj = {
//       items: { include: { medicine: true } },
//       distributor: true,
//     };
//     if (companyId) includeObj.company = true;

//     // 🔥 TRANSACTION START
//     const [po] = await prisma.$transaction([
//       prisma.purchaseOrder.create({
//         data: {
//           poNo,
//           distributorId,
//           indentId,
//           totalAmount,
//           netAmount: totalAmount,
//           remarks,
//           paymentType,
//           status: "OPEN",
//           items: {
//             create: items.map((item) => ({
//               medicineId: item.medicineId,
//               orderedQty: item.orderedQty,
//               rate: item.rate,
//               discountPercent: item.discountPercent || 0,
//               taxPercent: item.taxPercent || 0,
//               totalAmount: item.totalAmount,
//             })),
//           },
//         },
//         include: includeObj,
//       }),

//       // Update indent status
//       prisma.indent.update({
//         where: { id: indentId },
//         data: { status: "PO_CREATED" },
//       }),
//     ]);
//     // 🔥 TRANSACTION END

//     return res.status(201).json({
//       message: "PO created successfully & indent updated",
//       po,
//     });
//   } catch (error) {
//     console.error("createPO error:", error);
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

const createPO = async (req, res) => {
  try {
    let { poNo, distributorId, indentId, remarks, paymentType, items } =
      req.body;

    if (!poNo) poNo = await generatePONo();

    if (!distributorId || !indentId || !items?.length) {
      return res.status(400).json({ message: "Missing data" });
    }

    const totalAmount = items.reduce((s, i) => s + i.totalAmount, 0);

    const po = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create PO
      const po = await tx.purchaseOrder.create({
        data: {
          poNo,
          distributorId,
          indentId,
          totalAmount,
          netAmount: totalAmount,
          remarks,
          paymentType,
          status: "OPEN",
          items: {
            create: items.map((i) => ({
              medicineId: i.medicineId,
              orderedQty: i.orderedQty,
              rate: i.rate,
              discountPercent: i.discountPercent,
              taxPercent: i.taxPercent,
              totalAmount: i.totalAmount,
            })),
          },
        },
      });

      // 2️⃣ Mark indent items as completed
      await tx.indentItem.updateMany({
        where: {
          id: { in: items.map((i) => i.indentItemId) },
        },
        data: {
          isPoCreated: true,
        },
      });

      // 3️⃣ Update indent status
      const remaining = await tx.indentItem.count({
        where: {
          indentId,
          isPoCreated: false,
        },
      });

      await tx.indent.update({
        where: { id: indentId },
        data: {
          status: remaining === 0 ? "PO_GENERATE" : "PARTIAL",
        },
      });

      return po;
    });

    res.status(201).json({ message: "PO created", po });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------
// APPROVE PO (forward to accounts)
// -------------------------
const approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const approvedBy = req.user.id;

    if (!approvedBy)
      return res.status(400).json({ message: "Approver ID required" });

    // 1️⃣ Update PO status to APPROVED
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: {
        status: "APPROVED_AND_FORWARD_TO_ACCOUNTS",
        approvedBy,
        approvedAt: new Date(),
        remarks: remarks || "",
      },
      include: { items: { include: { medicine: true } }, distributor: true },
    });

    // 2️⃣ Only generate PDF if it doesn't exist yet
    let pdfPath = updatedPO.pdfUrl;
    if (!pdfPath) {
      pdfPath = await PurchaseOrderPdfGenerator(updatedPO);

      // 3️⃣ Save PDF path in DB
      await prisma.purchaseOrder.update({
        where: { id: Number(id) },
        data: { pdfUrl: pdfPath, pdfGeneratedAt: new Date() },
      });
    }

    return res.json({
      message: "PO approved & PDF generated",
      po: { ...updatedPO, pdfUrl: pdfPath },
    });
  } catch (error) {
    console.error("approvePO error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error?.message });
  }
};

const paymentStatusOptions = [
  { id: "FULL_AFTER_RECEIVE", name: "Full payment after receiving goods" },
  { id: "ADVANCE", name: "Advance payment before delivery" },
  {
    id: "PARTIAL_50_AFTER_RECEIVE",
    name: "50% payment now, 50% after receiving goods",
  },
  { id: "WITHIN_30_DAYS", name: "Payment within 30 days of delivery" },
];

const getApprovedPOs = async (req, res) => {
  try {
    const approvedPOs = await prisma.purchaseOrder.findMany({
      where: {
        status: {
          in: ["APPROVED", "APPROVED_AND_FORWARD_TO_ACCOUNTS", "PAID","Full payment after receiving goods","Advance payment before delivery","50% payment now, 50% after receiving goods","Payment within 30 days of delivery"],
        },
      },
      include: {
        items: true,
        distributor: true,
      },
      orderBy: { approvedAt: "desc" },
    });

    // Return POs + paymentStatusOptions together
    return res.json({
      data: approvedPOs,
      paymentStatusOptions, // ✅ include these in response
    });
  } catch (error) {
    console.error("getApprovedPOs error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error?.message || "Unknown error",
    });
  }
};

// -------------------------
// RECORD PAYMENT
// -------------------------
// Internal function to handle payment logic
const recordPaymentLogic = async (po, paidAmount, source = "ACCOUNTS") => {
  const newPaidAmount = (po.paidAmount || 0) + paidAmount;
  let newPaymentStatus = "PARTIAL";
  if (newPaidAmount >= po.netAmount) newPaymentStatus = "PAID";

  const updatedPO = await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
      status: newPaymentStatus === "PAID" ? "PAID" : "PARTIALLY_PAID",
    },
    include: { items: true, distributor: true, company: true },
  });

  // Generate PDF with payment slip
  const pdfUrl = await generatePOPDF(updatedPO);

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: { pdfFileUrl: pdfUrl },
  });

  // Notify company
  if (updatedPO.company?.email)
    await sendEmailWithAttachment(
      updatedPO.company.email,
      "PO Payment",
      pdfUrl,
    );

  if (updatedPO.company?.phone)
    await sendWhatsappMessage(
      updatedPO.company.phone,
      "PO Payment processed. PDF attached.",
      pdfUrl,
    );

  return updatedPO;
};

// API route for manual payment (accounts)
const recordPayment = async (req, res) => {
  try {
    const { poId, paidAmount } = req.body;
    if (!poId || !paidAmount)
      return res
        .status(400)
        .json({ message: "PO ID and paid amount required." });

    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.status !== "APPROVED" && po.status !== "PARTIALLY_PAID")
      return res.status(400).json({ message: "Only approved PO can be paid." });

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
// UPDATE PO STATUS manually (optional)
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

export {
  getAllPOs,
  getPOById,
  createPO,
  approvePO,
  recordPayment,
  updatePOStatus,
  recordPaymentLogic,
  getApprovedPOs,
};
