import { prisma } from "../../lib/prisma.js";
import { buildPaginationResponse, getPagination } from "../../utils/pagination.js";
import XLSX from "xlsx";

export const getSalesReport = async (req, res) => {
  try {
    const { fromDate, toDate, productId, variantId, page, limit, export: exportType } = req.query;

    const { page: pg, limit: lim, skip } = getPagination({ page, limit });

    const whereClause = {};

    if (fromDate && toDate) {
  whereClause.saleDate = {
    gte: new Date(fromDate),
    lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
  };
}

    if (productId || variantId) {
      whereClause.items = {
        some: {
          ...(variantId && { variantId: Number(variantId) }),
          ...(productId && {
            variant: { productId: Number(productId) },
          }),
        },
      };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: { items: true },
      orderBy: { saleDate: "asc" },
      ...(exportType ? {} : { skip, take: lim }),
    });

    const total = await prisma.sale.count({ where: whereClause });

    let totalSales = 0;
    let totalQty = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalProfit = 0;

    const excelData = [];

    sales.forEach((sale) => {
      totalSales += sale.netAmount || 0;
      totalDiscount += sale.discountAmount || 0;
      totalTax += sale.taxAmount || 0;

      const qty = sale.items.reduce((a, i) => a + i.quantity, 0);
      const profit = sale.items.reduce(
        (a, i) => a + (i.saleRate - (i.purchaseRate || 0)) * i.quantity,
        0
      );

      totalQty += qty;
      totalProfit += profit;

      excelData.push({
        ID: sale.id,
        "Sale No": sale.saleNo,
        Date: sale.saleDate.toISOString().split("T")[0],
        Customer: sale.customerName,
        "Payment Mode": sale.paymentMode,
        "Net Amount": sale.netAmount,
        Qty: qty,
        Profit: profit,
      });
    });

    // =========================
    // 📊 XLSX EXPORT
    // =========================
    if (exportType === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=sales-report.xlsx");

      return res.send(buffer);
    }

    // =========================
    // NORMAL RESPONSE
    // =========================
    const pagination = buildPaginationResponse(total, pg, lim, sales.length);

    return res.status(200).json({
      success: true,
      summary: { totalSales, totalQty, totalDiscount, totalTax, totalProfit },
      pagination,
      data: sales,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};