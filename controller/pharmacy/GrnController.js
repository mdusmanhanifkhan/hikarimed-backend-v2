import { prisma } from "../../lib/prisma.js";

/* =====================================================
   CREATE GRN
===================================================== */


export const createGRN = async (req, res) => {
  try {
    const {
      grnNo,
      grnDate,
      poId,
      poNo,
      poDate,
      distributorId,
      departmentId,
      invoiceNo,
      invoiceDate,
      invoiceType,
      invoiceStatus,
      remarks,
      items,
    } = req.body;

    const receivedBy = req.user?.id;

    if (!grnNo || !poId || !distributorId || !items?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔹 Check if GRN already exists for this PO
    const existingGRN = await prisma.gRN.findFirst({
      where: { poId },
    });

    if (existingGRN) {
      return res.status(400).json({ message: "A GRN already exists for this PO." });
    }

    // Prepare GRN items
    const grnItems = items.map((i) => ({
      medicineId: i.medicineId,
      orderedQty: i.orderedQty,
      previouslyReceivedQty: i.previouslyReceivedQty || 0,
      receivedQty: i.receivedQty,
      bonusQty: i.bonusQty || 0,
      totalQty: (i.receivedQty || 0) + (i.bonusQty || 0),
      pendingQty: (i.orderedQty || 0) - ((i.previouslyReceivedQty || 0) + (i.receivedQty || 0)),
      batchNo: i.batchNo,
      expiryDate: i.expiryDate ? new Date(i.expiryDate) : new Date(),
      rate: i.rate,
      grossAmount: (i.receivedQty || 0) * (i.rate || 0),
      discountPercent: i.discountPercent || 0,
      discountAmount: (((i.receivedQty || 0) * (i.rate || 0)) * (i.discountPercent || 0)) / 100,
      taxPercent: i.taxPercent || 0,
      taxAmount:
        ((((i.receivedQty || 0) * (i.rate || 0)) -
          (((i.receivedQty || 0) * (i.rate || 0)) * (i.discountPercent || 0)) / 100) *
          (i.taxPercent || 0)) /
        100,
      netAmount:
        ((i.receivedQty || 0) * (i.rate || 0)) -
        (((i.receivedQty || 0) * (i.rate || 0) * (i.discountPercent || 0)) / 100) +
        ((((i.receivedQty || 0) * (i.rate || 0) -
          ((i.receivedQty || 0) * (i.rate || 0) * (i.discountPercent || 0)) / 100) *
          (i.taxPercent || 0)) /
          100),
      mrp: i.mrp || null,
    }));

    // Create GRN with items
    const grn = await prisma.gRN.create({
      data: {
        grnNo,
        grnDate: grnDate ? new Date(grnDate) : undefined,
        poId,
        poNo,
        poDate: poDate ? new Date(poDate) : undefined,
        distributorId,
        departmentId: departmentId || null,
        invoiceNo,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        invoiceType,
        invoiceStatus,
        totalQty: grnItems.reduce((sum, x) => sum + x.totalQty, 0),
        grossAmount: grnItems.reduce((sum, x) => sum + x.grossAmount, 0),
        discountAmount: grnItems.reduce((sum, x) => sum + x.discountAmount, 0),
        taxAmount: grnItems.reduce((sum, x) => sum + x.taxAmount, 0),
        netAmount: grnItems.reduce((sum, x) => sum + x.netAmount, 0),
        receivedBy,
        remarks,
        items: { create: grnItems },
      },
      include: {
        items: true,
      },
    });

    // 🔹 Update Stock Ledger
    for (const item of grn.items) {
      const lastStock = await prisma.stockLedger.findFirst({
        where: {
          medicineId: item.medicineId,
          batchNo: item.batchNo,
        },
        orderBy: { createdAt: "desc" },
      });

      const balanceQty = (lastStock?.balanceQty || 0) + item.totalQty;
      const balanceValue = (lastStock?.balanceValue || 0) + item.netAmount;

      await prisma.stockLedger.create({
        data: {
          medicineId: item.medicineId,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          transactionType: "IN",
          refTable: "GRN",
          refId: grn.id,
          qtyIn: item.totalQty,
          valueIn: item.netAmount,
          balanceQty,
          balanceValue,
          rate: item.rate,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "GRN created and stock updated successfully",
      data: grn,
    });
  } catch (error) {
    console.error("createGRN error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* =====================================================
   GET ALL GRNs
===================================================== */
export const getAllGRNs = async (req, res) => {
  try {
    const grns = await prisma.gRN.findMany({
      orderBy: { grnDate: "desc" },
      include: {
        distributor: true,
        department: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    return res.json({ success: true, data: grns });
  } catch (error) {
    console.error("getAllGRNs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =====================================================
   GET GRN BY ID
===================================================== */
export const getGRNById = async (req, res) => {
  try {
    const { id } = req.params;

    const grn = await prisma.grn.findUnique({
      where: { id: Number(id) },
      include: {
        distributor: true,
        department: true,
        po: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!grn) {
      return res.status(404).json({ message: "GRN not found" });
    }

    return res.json({ success: true, data: grn });
  } catch (error) {
    console.error("getGRNById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const getStockList = async (req, res) => {
//   try {
//     const { companyId, medicineName, batchNo, expiryFilter } = req.query;

//     const where = {};

//     if (companyId) {
//       where.medicine = { companyId: Number(companyId) }; // assuming Medicine has companyId
//     }

//     if (medicineName) {
//       where.medicine = {
//         ...where.medicine,
//         name: { contains: medicineName, mode: "insensitive" },
//       };
//     }

//     if (batchNo) {
//       where.batchNo = { contains: batchNo };
//     }

//     if (expiryFilter) {
//       const today = new Date();
//       if (expiryFilter === "near") {
//         const threeMonthsLater = new Date();
//         threeMonthsLater.setMonth(today.getMonth() + 3);
//         where.expiryDate = { gte: today, lte: threeMonthsLater };
//       } else if (expiryFilter === "expired") {
//         where.expiryDate = { lt: today };
//       }
//     }

//     const stock = await prisma.stockLedger.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       include: {
//         medicine: true,
//       },
//     });

//     return res.json({ success: true, data: stock });
//   } catch (error) {
//     console.error("getStockList error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

export const getStockList = async (req, res) => {
  try {
    // 1️⃣ Get all distinct medicineId + batchNo
    const distinctBatches = await prisma.stockLedger.findMany({
      select: {
        medicineId: true,
        batchNo: true,
      },
      distinct: ['medicineId', 'batchNo'],
    });

    // 2️⃣ Get latest record for each batch
    const latestStocks = await Promise.all(
      distinctBatches.map(async (b) => {
        const last = await prisma.stockLedger.findFirst({
          where: { medicineId: b.medicineId, batchNo: b.batchNo },
          orderBy: { createdAt: 'desc' },
          include: { medicine: true },
        });
        return last;
      })
    );

    return res.json({ success: true, data: latestStocks });
  } catch (error) {
    console.error("getStockList error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
