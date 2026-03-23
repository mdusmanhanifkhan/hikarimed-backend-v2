import { prisma } from "../lib/prisma.js";

// Helper to build date range
function getDateRange(from, to) {
  let start, end;

  if (from && to) {
    start = new Date(from);
    start.setHours(0, 0, 0, 0);

    end = new Date(to);
    end.setHours(23, 59, 59, 999);
  } else {
    // Default: today
    const now = new Date();

    start = new Date(now);
    start.setHours(0, 0, 0, 0);

    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

// Department-wise revenue
async function getDepartmentRevenue(start, end) {
  console.log(start , end)
  const items = await prisma.medicalRecordItem.findMany({
    where: {
      medicalRecord: {
        recordDate: {
          gte: start,
          lte: end,
        },
      },
    },
    include: {
      department: {
        select: { name: true },
      },
    },
  });
console.log(items)
  const revenueMap = {};

  items.forEach((item) => {
    const deptName = item.department?.name || "Unknown";

    if (!revenueMap[deptName]) revenueMap[deptName] = 0;
    revenueMap[deptName] += Number(item.finalFee || 0);
  });

  return Object.entries(revenueMap)
    .map(([department, revenue]) => ({
      department,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Reception-wise revenue
async function getReceptionRevenue(start, end) {
  const records = await prisma.medicalRecord.findMany({
    where: {
      recordDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  const revenueMap = {};

  records.forEach((record) => {
    const userName = record.user?.name || "Unknown";

    if (!revenueMap[userName]) revenueMap[userName] = 0;
    revenueMap[userName] += Number(record.finalFee || 0);
  });

  return Object.entries(revenueMap).map(([user, revenue]) => ({
    user,
    revenue,
  }));
}

// Express Handler
export async function getFinancialReportHandler(req, res) {
  try {
    const { from, to } = req.query;

    const { start, end } = getDateRange(from, to);

    console.log("Report Range:", start, "to", end);

    const [departments, receptions] = await Promise.all([
      getDepartmentRevenue(start, end),
      getReceptionRevenue(start, end),
    ]);

    res.json({
      success: true,
      from: start,
      to: end,
      departments,
      receptions,
    });
  } catch (error) {
    console.error("Financial Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial report",
    });
  }
}
