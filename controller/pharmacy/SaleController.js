import { prisma } from "../../lib/prisma.js";

/* ========================= CREATE SALE ========================= */
export const createSale = async (req, res) => {
  try {
    const {
      saleNo,
      saleDate,
      customerName,
      paymentMode,
      totalDiscount = 0, 
      taxPercent = 0, 
      items,            
    } = req.body;

    if (!saleNo || !items?.length || !paymentMode) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    /* ---------------- CALCULATE FINANCIALS ---------------- */
    let grossAmount = 0;
    let totalItemDiscount = 0;

    const saleItems = items.map((i) => {
      const lineGross = i.quantity * i.saleRate;
      const lineDiscount = lineGross * ((i.discountPercent || 0) / 100);
      const lineAmount = lineGross - lineDiscount;

      grossAmount += lineGross;
      totalItemDiscount += lineDiscount;

      return {
        medicineId: i.medicineId,
        batchNo: i.batchNo,
        expiryDate: new Date(i.expiryDate),
        quantity: i.quantity,
        saleRate: i.saleRate,
        discountPercent: i.discountPercent || 0,
        taxPercent: i.taxPercent || 0,
        lineAmount,
      };
    });

    // Apply total discount if provided
    const discountAmount = totalItemDiscount + (totalDiscount || 0);
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount = (taxableAmount * (taxPercent || 0)) / 100;
    const netAmount = taxableAmount + taxAmount;

    /* ---------------- CREATE SALE ---------------- */
    const sale = await prisma.sale.create({
      data: {
        saleNo,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        customerName,
        paymentMode,
        grossAmount,
        discountAmount,
        taxAmount,
        netAmount,
        items: { create: saleItems },
      },
      include: {
        items: true,
      },
    });

    /* ---------------- UPDATE STOCK LEDGER ---------------- */
    for (const item of sale.items) {
      // Get last stock for medicine & batch
      const lastStock = await prisma.stockLedger.findFirst({
        where: { medicineId: item.medicineId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });

      const balanceQty = (lastStock?.balanceQty || 0) - item.quantity;
      const balanceValue = (lastStock?.balanceValue || 0) - item.lineAmount;

      await prisma.stockLedger.create({
        data: {
          medicineId: item.medicineId,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          transactionType: "OUT", // Sale out
          refTable: "SALE",
          refId: sale.id,
          qtyOut: item.quantity,
          valueOut: item.lineAmount,
          balanceQty,
          balanceValue,
          rate: item.saleRate,
        },
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Sale created successfully", data: sale });
  } catch (error) {
    console.error("createSale error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ========================= GET ALL SALES ========================= */
export const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: "desc" },
      include: { items: true },
    });
    return res.json({ success: true, data: sales });
  } catch (error) {
    console.error("getAllSales error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ========================= GET SALE BY ID ========================= */
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { medicine: true } } },
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.json({ success: true, data: sale });
  } catch (error) {
    console.error("getSaleById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


