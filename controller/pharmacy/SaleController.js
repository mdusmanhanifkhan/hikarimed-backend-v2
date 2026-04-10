import { prisma } from "../../lib/prisma.js";

export const createSale = async (req, res) => {
  try {
    const {
      saleDate,
      customerName,
      paymentMode,
      totalDiscount = 0,
      taxPercent = 0,
      items,
    } = req.body;

    // 1️⃣ Validate request
    if (!items?.length || !customerName || !paymentMode) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    console.log(items)

    let grossAmount = 0;
    let totalItemDiscount = 0;

    // 2️⃣ Prepare sale items and calculate line amounts
    const saleItems = [];

    for (const i of items) {
      const qty = i.quantity ?? 0;
      const saleRate = i.saleRate ?? 0;
      const discountPercent = i.discountPercent ?? 0;

      const lineGross = qty * saleRate;
      const lineDiscount = lineGross * (discountPercent / 100);
      const lineAmount = lineGross - lineDiscount;

      grossAmount += lineGross;
      totalItemDiscount += lineDiscount;

      saleItems.push({
        variantId: i.variantId,
        batchNo: i.batchNo,
        quantity: qty,
        saleRate,
        discountPercent,
        lineAmount,
      });
    }

    // 3️⃣ Calculate totals
    const discountAmount = totalItemDiscount + (totalDiscount || 0);
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount = (taxableAmount * (taxPercent || 0)) / 100;
    const netAmount = taxableAmount + taxAmount;

    // 4️⃣ Create Sale with items (Prisma will auto-generate saleNo)
    const sale = await prisma.sale.create({
      data: {
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        customerName,
        paymentMode,
        grossAmount,
        discountAmount,
        taxAmount,
        netAmount,
        items: { create: saleItems },
      },
      include: { items: true },
    });

    // 5️⃣ Update Stock Ledger
    for (const item of sale.items) {
      // Find last stock for this variant & batch
      console.log(item)
      const lastStock = await prisma.stockLedger.findFirst({
        where: { variantId: item.variantId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });
console.log(lastStock )
      if (!lastStock || lastStock.balanceQty < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for batch ${item.batchNo}`,
        });
      }

      const balanceQty = lastStock.balanceQty - item.quantity;
      const balanceValue = (lastStock.rate || 0) * balanceQty;
      const saleValue = (lastStock.rate || 0) * item.quantity;
      const customerDiscountAmount =
        item.quantity * item.saleRate - item.lineAmount;

      await prisma.stockLedger.create({
        data: {
          productId: lastStock.productId,
          variantId: item.variantId,
          batchNo: item.batchNo,
          expiryDate: lastStock.expiryDate,
          transactionType: "OUT",
          refTable: "SALE",
          refId: sale.id,
          qtyIn: 0,
          valueIn: 0,
          qtyOut: item.quantity,
          valueOut: saleValue,
          balanceQty,
          balanceValue,
          rate: lastStock.rate,
          saleRate: item.saleRate,
          discountPercent: item.discountPercent,
          discountAmount: customerDiscountAmount,
        },
      });
    }
console.log("Sale created successfully.")
    // 6️⃣ Return response including auto-generated saleNo
    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    console.error("createSale error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ========================= GET SALE BY ID ========================= */
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true, // get product/medicine name
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Map sale items for sale return
    const saleItems = sale.items.map((i) => ({
      id: i.id, // sale item id
      variantId: i.variantId,
      medicineName: i.variant.product.name, // get product name via variant
      batchNo: i.batchNo,
      stockQty: i.quantity, // original sold quantity
      qty: i.quantity, // default full return qty
      saleRate: i.saleRate,
      total: i.saleRate * i.quantity,
    }));

    return res.json({
      success: true,
      data: {
        id: sale.id,
        saleNo: sale.saleNo,
        saleDate: sale.saleDate,
        customerName: sale.customerName,
        paymentMode: sale.paymentMode,
        items: saleItems,
      },
    });
  } catch (error) {
    console.error("getSaleById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ========================= CREATE SALE RETURN ========================= */
export const createSaleReturn = async (req, res) => {
  try {
    const { saleId, reason, items } = req.body;

    // ✅ Validate request
    if (!saleId || !items?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Convert saleId to number
    const saleIdNum = Number(saleId);
    if (isNaN(saleIdNum)) {
      return res.status(400).json({ message: "Invalid sale ID" });
    }

    // 1️⃣ Fetch original sale with items
    const sale = await prisma.sale.findUnique({
      where: { id: saleIdNum },
      include: { items: true },
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    let totalRefund = 0;
    const returnItems = [];

    // 2️⃣ Prepare return items and validate quantities
    for (const i of items) {
      const soldItem = sale.items.find((item) => item.id === i.saleItemId);
      if (!soldItem) {
        return res
          .status(400)
          .json({ message: `Sale item ID ${i.saleItemId} not found` });
      }

      if (i.returnQty > soldItem.quantity) {
        return res.status(400).json({
          message: `Return quantity exceeds sold quantity for item ${soldItem.id}`,
        });
      }

      const amount = i.returnQty * soldItem.saleRate;
      totalRefund += amount;

      // Use expiry date from original sale item (never override)
      returnItems.push({
        variantId: soldItem.variantId,
        batchNo: soldItem.batchNo,
        expiryDate: i.expiryDate, 
        returnQty: i.returnQty,
        saleRate: soldItem.saleRate,
        amount,
      });
    }

    // 3️⃣ Create sale return
    const saleReturn = await prisma.saleReturn.create({
      data: {
        saleId: saleIdNum,
        reason,
        totalRefund,
        items: { create: returnItems },
      },
      include: { items: true },
    });

    // 4️⃣ Update stock ledger without changing expiry
    for (const item of saleReturn.items) {
      const lastStock = await prisma.stockLedger.findFirst({
        where: { variantId: item.variantId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });

      if (!lastStock) continue;

      const balanceQty = (lastStock.balanceQty || 0) + item.returnQty;
      const balanceValue = (lastStock.rate || 0) * balanceQty;

      await prisma.stockLedger.create({
        data: {
          productId: lastStock.productId,
          variantId: item.variantId,
          batchNo: item.batchNo,
          expiryDate: lastStock.expiryDate,
          transactionType: "SALE_RETURN",
          refTable: "SALE_RETURN",
          refId: saleReturn.id,
          qtyIn: item.returnQty,
          valueIn: (lastStock.rate || 0) * item.returnQty,
          balanceQty,
          balanceValue,
          rate: lastStock.rate,
          saleRate: item.saleRate,
          discountPercent: 0,
          discountAmount: 0,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sale return created successfully",
      data: saleReturn,
    });
  } catch (error) {
    console.error("createSaleReturn error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ========================= GET ALL SALE RETURNS ========================= */
export const getAllSaleReturns = async (req, res) => {
  try {
    const returns = await prisma.saleReturn.findMany({
      orderBy: { returnDate: "desc" },
      include: { items: true, sale: true },
    });

    return res.json({ success: true, data: returns });
  } catch (error) {
    console.error("getAllSaleReturns error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ========================= GET SALE RETURN BY ID ========================= */
export const getSaleReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const saleReturn = await prisma.saleReturn.findUnique({
      where: { id: Number(id) },
      include: { items: true, sale: true },
    });

    if (!saleReturn) {
      return res.status(404).json({ message: "Sale return not found" });
    }

    return res.json({ success: true, data: saleReturn });
  } catch (error) {
    console.error("getSaleReturnById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
