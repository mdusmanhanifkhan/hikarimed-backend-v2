import { prisma } from "../../lib/prisma.js";

/* ========================= CREATE SALE ========================= */
// export const createSale = async (req, res) => {
//   try {
//     const {
//       saleNo,
//       saleDate,
//       customerName,
//       paymentMode,
//       totalDiscount = 0,
//       taxPercent = 0,
//       items,
//     } = req.body;

//     if (!saleNo || !items?.length || !paymentMode) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     /* ---------------- CALCULATE FINANCIALS ---------------- */
//     let grossAmount = 0;
//     let totalItemDiscount = 0;

//     const saleItems = items.map((i) => {
//       // Use safe defaults for null or undefined
//       const saleRate = i.saleRate ?? 0;
//       const discountPercent = i.discountPercent ?? 0;
//       const qty = i.quantity ?? 0;

//       const lineGross = qty * saleRate;
//       const lineDiscount = lineGross * (discountPercent / 100);
//       const lineAmount = lineGross - lineDiscount;

//       grossAmount += lineGross;
//       totalItemDiscount += lineDiscount;

//       return {
//         medicineId: i.medicineId,
//         batchNo: i.batchNo,
//         expiryDate: i.expiryDate ? new Date(i.expiryDate) : new Date(),
//         quantity: qty,
//         saleRate,
//         discountPercent,
//         taxPercent: i.taxPercent ?? 0,
//         lineAmount,
//       };
//     });

//     const discountAmount = totalItemDiscount + (totalDiscount ?? 0);
//     const taxableAmount = grossAmount - discountAmount;
//     const taxAmount = (taxableAmount * (taxPercent ?? 0)) / 100;
//     const netAmount = taxableAmount + taxAmount;

//     /* ---------------- CREATE SALE ---------------- */
//     const sale = await prisma.sale.create({
//       data: {
//         saleNo,
//         saleDate: saleDate ? new Date(saleDate) : new Date(),
//         customerName,
//         paymentMode,
//         grossAmount,
//         discountAmount,
//         taxAmount,
//         netAmount,
//         items: { create: saleItems },
//       },
//       include: { items: true },
//     });

//     /* ---------------- UPDATE STOCK LEDGER ---------------- */
//  for (const item of sale.items) {
//   const lastStock = await prisma.stockLedger.findFirst({
//     where: { medicineId: item.medicineId, batchNo: item.batchNo },
//     orderBy: { createdAt: "desc" },
//   });

//   if (!lastStock) continue;

//   const balanceQty = (lastStock.balanceQty || 0) - (item.quantity || 0);
//   const balanceValue = (lastStock.rate || 0) * balanceQty;

//   await prisma.stockLedger.create({
//     data: {
//       medicineId: item.medicineId,
//       batchNo: item.batchNo,
//       expiryDate: item.expiryDate,
//       transactionType: "OUT",
//       refTable: "SALE",
//       refId: sale.id,
//       qtyOut: item.quantity,
//       valueOut: (lastStock.rate || 0) * (item.quantity || 0), // stock value only
//       balanceQty,
//       balanceValue,
//       rate: lastStock.rate,           // keep original purchase rate
//       discountPercent: lastStock.discountPercent,
//       discountAmount: lastStock.discountAmount,
//       saleRate: item.saleRate,        // optional: just for info
//       customerDiscountPercent: item.discountPercent ?? 0,
//       customerDiscountAmount: item.lineAmount - (item.quantity * item.saleRate),
//     },
//   });
// }


//     return res.status(201).json({
//       success: true,
//       message: "Sale created successfully",
//       data: sale,
//     });
//   } catch (error) {
//     console.error("createSale error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

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

    let grossAmount = 0;
    let totalItemDiscount = 0;

    const saleItems = items.map((i) => {
      const saleRate = i.saleRate ?? 0;
      const discountPercent = i.discountPercent ?? 0;
      const qty = i.quantity ?? 0;

      const lineGross = qty * saleRate;
      const lineDiscount = lineGross * (discountPercent / 100);
      const lineAmount = lineGross - lineDiscount;

      grossAmount += lineGross;
      totalItemDiscount += lineDiscount;

      return {
        medicineId: i.medicineId,
        batchNo: i.batchNo || i.batch, // accept front-end batch field
        expiryDate: i.expiryDate ? new Date(i.expiryDate) : new Date(),
        quantity: qty,
        saleRate,
        discountPercent,
        lineAmount,
      };
    });

    const discountAmount = totalItemDiscount + (totalDiscount ?? 0);
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount = (taxableAmount * (taxPercent ?? 0)) / 100;
    const netAmount = taxableAmount + taxAmount;

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
      include: { items: true },
    });

    // 🔹 Correct stock ledger update for Sale
    for (const item of sale.items) {
      const lastStock = await prisma.stockLedger.findFirst({
        where: { medicineId: item.medicineId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });

      if (!lastStock || lastStock.balanceQty < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for batch ${item.batchNo}`,
        });
      }

      const previousQty = lastStock.balanceQty;
      const previousValue = lastStock.balanceValue;

      const saleValue = (lastStock.rate || 0) * item.quantity; // use purchase rate for value
      const customerDiscountAmount =
        item.quantity * item.saleRate - item.lineAmount; // correct discount

      await prisma.stockLedger.create({
        data: {
          medicineId: item.medicineId,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          transactionType: "OUT",
          refTable: "SALE",
          refId: sale.id,
          qtyIn: 0,
          valueIn: 0,
          qtyOut: item.quantity,
          valueOut: saleValue,
          balanceQty: previousQty - item.quantity,
          balanceValue: previousValue - saleValue,
          rate: lastStock.rate,
          discountPercent: item.discountPercent,
          discountAmount: customerDiscountAmount,
          saleRate: item.saleRate,
          customerDiscountPercent: item.discountPercent,
          customerDiscountAmount,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
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


