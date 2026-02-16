import { prisma } from "../../lib/prisma.js";

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

    const existingGRN = await prisma.gRN.findFirst({ where: { poId } });
    if (existingGRN) {
      return res
        .status(400)
        .json({ message: "A GRN already exists for this PO." });
    }

    const grnItems = items.map((i) => {
      const receivedQty = i.receivedQty || 0;
      const bonusQty = i.bonusQty || 0;
      const totalQty = receivedQty + bonusQty;
      const orderedQty = i.orderedQty || totalQty;
      const previouslyReceivedQty = i.previouslyReceivedQty || 0;

      const rate = i.rate || 0;
      const discountPercent = i.discountPercent || 0;
      const taxPercent = i.taxPercent || 0;

      const discountedRate = rate - (rate * discountPercent) / 100;
      const netAmount = totalQty * discountedRate * (1 + taxPercent / 100);

      return {
        medicineId: i.medicineId,
        batchNo: i.batchNo,
        expiryDate: i.expiryDate ? new Date(i.expiryDate) : new Date(),
        receivedQty,
        bonusQty,
        totalQty,
        orderedQty,
        previouslyReceivedQty,
        pendingQty: orderedQty - (previouslyReceivedQty + receivedQty), // ✅ calculate
        rate,
        discountPercent,
        taxPercent,
        netAmount,
        saleRate: i.saleRate || discountedRate + 30,
        mrp: i.mrp || null,
      };
    });

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
        grossAmount: grnItems.reduce((sum, x) => sum + x.rate * x.totalQty, 0),
        discountAmount: grnItems.reduce(
          (sum, x) => sum + (x.rate * x.totalQty * x.discountPercent) / 100,
          0,
        ),
        taxAmount: grnItems.reduce(
          (sum, x) => sum + (x.rate * x.totalQty * x.taxPercent) / 100,
          0,
        ),
        netAmount: grnItems.reduce((sum, x) => sum + x.netAmount, 0),
        receivedBy,
        remarks,
        items: { create: grnItems },
      },
      include: { items: true },
    });

    // 🔹 Update Stock Ledger correctly
    for (const item of grn.items) {
      const lastStock = await prisma.stockLedger.findFirst({
        where: { medicineId: item.medicineId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });

      const previousQty = lastStock?.balanceQty || 0;
      const previousValue = lastStock?.balanceValue || 0;

      const customerDiscountPercent = item.customerDiscountPercent || 0;
      const customerDiscountAmount =
        ((item.saleRate || 0) * item.totalQty * customerDiscountPercent) / 100;

      await prisma.stockLedger.create({
        data: {
          medicineId: item.medicineId,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          transactionType: "GRN",
          refTable: "GRN",
          refId: grn.id,
          qtyIn: item.totalQty,
          valueIn: item.netAmount,
          qtyOut: 0,
          valueOut: 0,
          balanceQty: previousQty + item.totalQty,
          balanceValue: previousValue + item.netAmount,
          rate: item.rate,
          discountPercent: item.discountPercent,
          discountAmount: item.discountAmount,
          saleRate: item.saleRate,
          customerDiscountPercent,
          customerDiscountAmount,
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
        items: { include: { medicine: true } },
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

    const grn = await prisma.gRN.findUnique({
      where: { id: Number(id) },
      include: {
        distributor: true,
        department: true,
        po: true,
        items: { include: { medicine: true } },
      },
    });

    if (!grn) return res.status(404).json({ message: "GRN not found" });

    return res.json({ success: true, data: grn });
  } catch (error) {
    console.error("getGRNById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =====================================================
   GET STOCK LIST (latest balance per batch)
===================================================== */
export const getStockList = async (req, res) => {
  try {
    // 1️⃣ Get all distinct medicineId + batchNo
    const distinctBatches = await prisma.stockLedger.findMany({
      select: { medicineId: true, batchNo: true },
      distinct: ["medicineId", "batchNo"],
    });

    // 2️⃣ Get latest record for each batch with nested medicine + dosageForm
    const latestStocks = await Promise.all(
      distinctBatches.map(async (b) => {
        const last = await prisma.stockLedger.findFirst({
          where: { medicineId: b.medicineId, batchNo: b.batchNo },
          orderBy: { createdAt: "desc" },
          include: {
            medicine: {
              include: {
                dosageForm: true, // Include dosage form details
              },
            },
          },
        });
        return last;
      })
    );

    // 3️⃣ Filter out batches with zero balance
    const filteredStocks = latestStocks.filter((stock) => stock.balanceQty > 0);

    // 4️⃣ Group by medicine
    const grouped = filteredStocks.reduce((acc, stock) => {
      const medId = stock.medicine.id;

      if (!acc[medId]) {
        acc[medId] = {
          id: stock.medicine.id,
          name: stock.medicine.name,
          categoryId: stock.medicine.categoryId,
          dosageForm: stock.medicine.dosageForm
            ? {
                id: stock.medicine.dosageForm.id,
                name: stock.medicine.dosageForm.name,
              }
            : null,
          unitId: stock.medicine.unitId,
          companyId: stock.medicine.companyId,
          genericNameId: stock.medicine.genericNameId,
          batches: [],
        };
      }

      acc[medId].batches.push({
        id: stock.id,
        batchNo: stock.batchNo,
        expiryDate: stock.expiryDate,
        transactionType: stock.transactionType,
        qtyIn: stock.qtyIn,
        qtyOut: stock.qtyOut,
        rate: stock.rate,
        discountPercent: stock.discountPercent,
        discountAmount: stock.discountAmount,
        saleRate: stock.saleRate,
        valueIn: stock.valueIn,
        valueOut: stock.valueOut,
        balanceQty: stock.balanceQty,
        balanceValue: stock.balanceValue,
        customerDiscountPercent: stock.customerDiscountPercent,
        customerDiscountAmount: stock.customerDiscountAmount,
      });

      return acc;
    }, {});

    // Convert object to array
    const result = Object.values(grouped);

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("getStockList error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

