import { prisma } from "../../lib/prisma.js";

const POStatus = {
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
};

const IndentStatus = {
  CLOSED: "CLOSED",
};

export const createGRN = async (req, res) => {
  try {
    const { grnNo, grnDate, poId, supplierId, departmentId, items } = req.body;

    if (!grnNo || !supplierId || !items?.length) {
      return res
        .status(400)
        .json({ message: "GRN No, Supplier, and items are required." });
    }

    // Check if GRN already exists for this PO
    if (poId) {
      const existing = await prisma.goodsReceipt.findFirst({
        where: { poId },
        include: { po: true },
      });

      if (existing) {
        return res.status(400).json({
          message: `A Goods Receipt (GRN) already exists for Purchase Order ${existing.po?.poNo}. You cannot create another GRN for the same PO.`,
        });
      }
    }

    // Prepare GRN items
    const receiptItems = items.map((i) => {
      const receivedQty = Number(i.receivedQty || 0);
      const bonusQty = Number(i.bonusQty || 0);
      const purchasePrice = Number(i.purchasePrice || i.rate || 0);
      const salePrice = Number(i.salePrice || i.saleRate || 0);
      const discountPercent = Number(i.discountPercent || 0);
      const discountAmount = Number(i.discountAmount || 0);
      const customerDiscountPercent = Number(i.customerDiscountPercent || 0);

      const totalQty = receivedQty + bonusQty;

      // Apply purchase discount first
      let discountedPrice = purchasePrice;
      if (discountAmount > 0) {
        discountedPrice -= discountAmount;
      } else if (discountPercent > 0) {
        discountedPrice -= (purchasePrice * discountPercent) / 100;
      }

      // Apply customer discount
      if (customerDiscountPercent > 0) {
        discountedPrice -= (discountedPrice * customerDiscountPercent) / 100;
      }

      discountedPrice = Math.max(discountedPrice, 0);

      const netAmount = totalQty * discountedPrice;

      if (!i.productId && !i.medicineId) {
        throw new Error("ProductId is missing in items");
      }

      return {
        productId: i.productId || i.medicineId,
        variantId: i.variantId || null,

        orderedQty: i.orderedQty || null,
        receivedQty,
        bonusQty,

        batchNo: i.batchNo || null,
        expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,

        purchasePrice,
        salePrice,

        discountPercent,
        discountAmount,
        customerDiscountPercent, // ✅ Save it
        netAmount,
      };
    });

    // Calculate totals
    const totalQty = receiptItems.reduce(
      (sum, x) => sum + x.receivedQty + (x.bonusQty || 0),
      0,
    );
    const netAmount = receiptItems.reduce((sum, x) => sum + x.netAmount, 0);

    // Create Goods Receipt (GRN)
    const receipt = await prisma.goodsReceipt.create({
      data: {
        receiptNo: grnNo,
        receiptDate: grnDate ? new Date(grnDate) : new Date(),

        supplierId,
        poId: poId || null,
        departmentId: departmentId || null,

        totalQty,
        netAmount,

        items: { create: receiptItems },
      },
      include: { items: true },
    });

    // Update Stock Ledger
    for (const item of receipt.items) {
      const lastStock = await prisma.stockLedger.findFirst({
        where: { productId: item.productId, batchNo: item.batchNo },
        orderBy: { createdAt: "desc" },
      });

      const previousQty = lastStock?.balanceQty || 0;
      const previousValue = lastStock?.balanceValue || 0;

      const qtyIn = item.receivedQty + (item.bonusQty || 0);

      // Calculate value in after all discounts
      let valueIn = item.purchasePrice * qtyIn;

      // Apply purchase discount first
      if (item.discountAmount > 0) {
        valueIn -= item.discountAmount;
      } else if (item.discountPercent > 0) {
        valueIn -= (item.purchasePrice * qtyIn * item.discountPercent) / 100;
      }

      // Apply customer discount
      if (item.customerDiscountPercent > 0) {
        valueIn -= (valueIn * item.customerDiscountPercent) / 100;
      }

      await prisma.stockLedger.create({
        data: {
          productId: item.productId,
          variantId: item.variantId || null,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,

          transactionType: "GRN",
          refTable: "GoodsReceipt",
          refId: receipt.id,

          qtyIn,
          qtyOut: 0,

          rate: item.purchasePrice, // purchase price
          saleRate: item.salePrice, // sale price

          balanceQty: previousQty + qtyIn,
          valueIn,
          valueOut: 0,
          balanceValue: previousValue + valueIn,
          discountPercent: item.discountPercent || 0,
          discountAmount: item.discountAmount || 0,
          customerDiscountPercent: item.customerDiscountPercent || 0, // ✅ Add here
        },
      });
    }

    // Update Purchase Order status
    if (poId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: poId },
        include: { items: true, receipts: { include: { items: true } } },
      });

      if (po) {
        const totalOrderedQty = po.items.reduce(
          (sum, i) => sum + i.orderedQty,
          0,
        );
        const totalReceivedQty = po.receipts.reduce(
          (sum, r) =>
            sum +
            r.items.reduce((s, i) => s + i.receivedQty + (i.bonusQty || 0), 0),
          0,
        );

        let newStatus = POStatus.PARTIALLY_RECEIVED;
        if (totalReceivedQty >= totalOrderedQty) newStatus = POStatus.RECEIVED;

        await prisma.purchaseOrder.update({
          where: { id: poId },
          data: { status: newStatus },
        });

        // Update related Indent
        if (po.prId) {
          await prisma.indenItem.updateMany({
            where: { indentId: po.prId },
            data: { isPoCreated: true },
          });

          const indentItems = await prisma.indenItem.findMany({
            where: { indentId: po.prId },
          });
          const allPoCreated = indentItems.every((item) => item.isPoCreated);

          if (allPoCreated) {
            await prisma.indent.update({
              where: { id: po.prId },
              data: { status: IndentStatus.CLOSED },
            });
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Goods Receipt created successfully, PO and Indent updated.",
      data: receipt,
    });
  } catch (error) {
    console.error("createGRN error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

/* =====================================================
   GET ALL GRNs
===================================================== */
export const getAllGRNs = async (req, res) => {
  try {
    const grns = await prisma.goodsReceipt.findMany({
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

    const grn = await prisma.goodsReceipt.findUnique({
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
    // 1️⃣ Get all distinct productId + variantId + batchNo
    const distinctBatches = await prisma.stockLedger.findMany({
      select: { productId: true, variantId: true, batchNo: true },
      distinct: ["productId", "variantId", "batchNo"],
    });

    // 2️⃣ Get latest record for each batch
    const latestStocks = await Promise.all(
      distinctBatches.map(async (b) => {
        const last = await prisma.stockLedger.findFirst({
          where: {
            productId: b.productId,
            variantId: b.variantId || null,
            batchNo: b.batchNo,
          },
          orderBy: { createdAt: "desc" },
          include: {
            product: true,
            variant: true,
          },
        });
        return last;
      }),
    );

    // 3️⃣ Filter out batches with zero balance
    const filteredStocks = latestStocks.filter(
      (stock) => stock && stock.balanceQty > 0,
    );

    // 4️⃣ Group by product
    const grouped = filteredStocks.reduce((acc, stock) => {
      const prodId = stock.product.id;

      if (!acc[prodId]) {
        acc[prodId] = {
          id: stock.product.id,
          name: stock.product.name,
          categoryId: stock.product.categoryId,
          unitId: stock.product.unitId,
          companyId: stock.product.companyId,
          genericNameId: stock.product.genericNameId,
          batches: [],
        };
      }

      acc[prodId].batches.push({
        id: stock.id,
        batchNo: stock.batchNo,
        expiryDate: stock.expiryDate,
        transactionType: stock.transactionType,
        qtyIn: stock.qtyIn,
        qtyOut: stock.qtyOut,
        rate: stock.rate,
        saleRate: stock.saleRate,
        valueIn: stock.valueIn,
        valueOut: stock.valueOut,
        balanceQty: stock.balanceQty,
        balanceValue: stock.balanceValue,

        // Variant info
        variantId: stock.variant?.id || null,
        sku: stock.variant?.sku || null,
        discountPercent: stock.variant?.discountPercent || 0,
        discountAmount: stock.variant?.discountAmount || 0,
        customerDiscountPercent: stock.variant?.customerDiscountPercent || 0, // ✅ added
      });

      return acc;
    }, {});

    return res.json({ success: true, data: Object.values(grouped) });
  } catch (error) {
    console.error("getStockList error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* =====================================================
   GET STOCK LIST FOR SALE (latest balance per batch, hide expired/zero)
===================================================== */
export const getStockListForSale = async (req, res) => {
  try {
    const today = new Date();

    // 1️⃣ Get all distinct productId + variantId + batchNo
    const distinctBatches = await prisma.stockLedger.findMany({
      select: { productId: true, variantId: true, batchNo: true },
      distinct: ["productId", "variantId", "batchNo"],
    });

    // 2️⃣ Get latest record for each batch
    const latestStocks = await Promise.all(
      distinctBatches.map(async (b) => {
        const last = await prisma.stockLedger.findFirst({
          where: {
            productId: b.productId,
            variantId: b.variantId || null,
            batchNo: b.batchNo,
          },
          orderBy: { createdAt: "desc" },
          include: {
            product: true,
            variant: true,
          },
        });
        return last;
      }),
    );

    // 3️⃣ Filter out zero balance or expired batches
    const filteredStocks = latestStocks.filter((stock) => {
      if (!stock) return false;
      if (stock.balanceQty <= 0) return false;
      if (stock.expiryDate && new Date(stock.expiryDate) < today) return false;
      return true;
    });

    // 4️⃣ Group by product
    const grouped = filteredStocks.reduce((acc, stock) => {
      const prodId = stock.product.id;

      if (!acc[prodId]) {
        acc[prodId] = {
          id: stock.product.id,
          name: stock.product.name,
          categoryId: stock.product.categoryId,
          unitId: stock.product.unitId,
          companyId: stock.product.companyId,
          genericNameId: stock.product.genericNameId,
          batches: [],
        };
      }

      acc[prodId].batches.push({
        id: stock.id,
        batchNo: stock.batchNo,
        expiryDate: stock.expiryDate,
        transactionType: stock.transactionType,
        qtyIn: stock.qtyIn,
        qtyOut: stock.qtyOut,
        rate: stock.rate,
        saleRate: stock.saleRate,
        valueIn: stock.valueIn,
        valueOut: stock.valueOut,
        balanceQty: stock.balanceQty,
        balanceValue: stock.balanceValue,

        // Variant info
        variantId: stock.variant?.id || null,
        sku: stock.variant?.sku || null,
        discountPercent: stock.variant?.discountPercent || 0,
        discountAmount: stock.variant?.discountAmount || 0,
        customerDiscountPercent: stock.customerDiscountPercent  || 0, // ✅ added
      });

      return acc;
    }, {});

    return res.json({ success: true, data: Object.values(grouped) });
  } catch (error) {
    console.error("getStockListForSale error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// GET /api/grn/next-grn-no
export const getNextGRNNo = async (req, res) => {
  try {

    const lastGRN = await prisma.goodsReceipt.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextGRNNo = "GRN-001";
    if (lastGRN) {
      const lastNumber = parseInt(lastGRN.receiptNo.split("-")[1] || "0", 10);
      nextGRNNo = `GRN-${(lastNumber + 1).toString().padStart(3, "0")}`;
    }

    return res.json({
      success: true,
      grnNo: nextGRNNo,
    });
  } catch (error) {
    console.error("getNextGRNNo error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
