
import { prisma } from "../lib/prisma.js";


// Helper to get start/end of today
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Department-wise revenue
async function getDepartmentRevenueToday() {
  const { start, end } = getTodayRange();

  // Group by department directly using MedicalRecordItem
  const revenueItems = await prisma.medicalRecordItem.findMany({
    where: {
      medicalRecord: { recordDate: { gte: start, lte: end } },
    },
    select: {
      departmentId: true,
      finalFee: true,
    },
  });

  // Sum per department
  const revenueMap = {};
  revenueItems.forEach(item => {
    const deptId = item.departmentId;
    if (!revenueMap[deptId]) revenueMap[deptId] = 0;
    revenueMap[deptId] += Number(item.finalFee);
  });

  // Fetch department names in one query
  const deptIds = Object.keys(revenueMap).map(Number);
  const departments = await prisma.department.findMany({
    where: { id: { in: deptIds } },
  });

  return deptIds.map(id => {
    const dept = departments.find(d => d.id === id);
    return { department: dept ? dept.name : 'Unknown', revenue: revenueMap[id] };
  }).sort((a, b) => b.revenue - a.revenue);
}

async function getReceptionRevenueToday() {
  const { start, end } = getTodayRange();

  // Fetch only today's medical records
  const records = await prisma.medicalRecord.findMany({
    where: { recordDate: { gte: start, lte: end } },
    select: {
      finalFee: true,
      userId: true, // ✅ user who created the record
    },
  });

  // Sum revenue per user
  const revenueMap = {};
  records.forEach(rec => {
    const userId = rec.userId;
    if (!revenueMap[userId]) revenueMap[userId] = 0;
    revenueMap[userId] += Number(rec.finalFee);
  });

  // Fetch user names in one query
  const userIds = Object.keys(revenueMap).map(Number);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  return userIds.map(id => {
    const user = users.find(u => u.id === id);
    return { user: user ? user.name : 'Unknown', revenue: revenueMap[id] };
  });
}


// Express handler
export async function getFinancialReportTodayHandler(req, res) {
  try {
    const [departments, receptions] = await Promise.all([
      getDepartmentRevenueToday(),
      getReceptionRevenueToday(),
    ]);
    res.json({ departments, receptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's financial report" });
  }
}
