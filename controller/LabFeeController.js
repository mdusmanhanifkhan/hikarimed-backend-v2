
import { prisma } from "../lib/prisma.js";


/**
 * Helper to compute final price
 */
const computeFinalPrice = (price, discount = 0) => {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;

  return p - (p * d) / 100;
};

/**
 * ➕ Create Lab Fee
 */
export const createLabFee = async (req, res) => {
  try {
    const { status, departmentId, procedureId, price, discount, description } =
      req.body;

    if (!departmentId || !procedureId || !price)
      return res
        .status(400)
        .json({ message: "Department, Procedure & Price are required" });

    // prevent duplicate fee
    const exists = await prisma.labFee.findFirst({
      where: { departmentId, procedureId },
    });

    if (exists)
      return res.status(400).json({
        message: "Fee already exists for this procedure in this department",
      });

    const finalPrice = computeFinalPrice(price, discount);

    const labFee = await prisma.labFee.create({
      data: {
        status: status ?? true,
        departmentId,
        procedureId,
        price,
        discount: discount ?? 0,
        finalPrice,
        description,
      },
      include: {
        department: true,
        procedure: true,
      },
    });

    return res.status(201).json({
      message: "Lab fee created successfully",
      data: labFee,
    });
  } catch (error) {
    console.error("Create Lab Fee Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 📜 Get Lab Fees (with filters + pagination)
 */
export const getLabFees = async (req, res) => {
  try {
    const {
      departmentId,
      procedureId,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {
      ...(departmentId && { departmentId: Number(departmentId) }),
      ...(procedureId && { procedureId: Number(procedureId) }),
      ...(status !== undefined &&
        status !== "all" && { status: status === "true" }),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [fees, total] = await Promise.all([
      prisma.labFee.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: "desc" },
        include: {
          department: { select: { id: true, name: true } },
          procedure: { select: { id: true, name: true } },
        },
      }),

      prisma.labFee.count({ where }),
    ]);

    return res.status(200).json({
      message: "Lab fees retrieved successfully",
      data: fees,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Lab Fees Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ✏ Update Lab Fee
 */
export const updateLabFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, procedureId, price, discount, status, description } =
      req.body;

    const finalPrice =
      price !== undefined ? computeFinalPrice(price, discount) : undefined;

    const labFee = await prisma.labFee.update({
      where: { id: Number(id) },
      data: {
        departmentId,
        procedureId,
        price,
        discount,
        finalPrice,
        status,
        description,
      },
    });

    return res.status(200).json({
      message: "Lab fee updated successfully",
      data: labFee,
    });
  } catch (error) {
    console.error("Update Lab Fee Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔁 Enable / Disable Lab Fee
 */
export const toggleLabFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await prisma.labFee.findUnique({
      where: { id: Number(id) },
    });

    if (!fee) return res.status(404).json({ message: "Lab fee not found" });

    const updated = await prisma.labFee.update({
      where: { id: Number(id) },
      data: { status: !fee.status },
    });

    return res.status(200).json({
      message: `Lab fee ${
        updated.status ? "activated" : "disabled"
      } successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle Lab Fee Status Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 📄 Get single Lab Fee by ID
 */
export const getLabFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const labFee = await prisma.labFee.findUnique({
      where: { id: Number(id) },
      include: {
        department: { select: { id: true, name: true } },
        procedure: { select: { id: true, name: true } },
      },
    });

    if (!labFee)
      return res.status(404).json({ message: "Lab fee not found" });

    return res.status(200).json({
      message: "Lab fee retrieved successfully",
      data: labFee,
    });
  } catch (error) {
    console.error("Get Lab Fee Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
