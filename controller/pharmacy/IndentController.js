import { prisma } from "../../lib/prisma.js";
import {
  buildPaginationResponse,
  getPagination,
} from "../../utils/pagination.js";

// Helper to generate unique indent number
const generateIndentNo = async () => {
  const count = await prisma.indent.count();
  return `IND-${(count + 1).toString().padStart(5, "0")}`;
};

/**
 * Create a new Indent
 */
const createIndent = async (req, res) => {
  try {
    const { departmentId, items, remarks } = req.body;

    const userId = req.user?.id;
    const createdBy = userId;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ message: "requestedBy and items are required" });
    }

    const indentNo = await generateIndentNo();

    const newIndent = await prisma.indent.create({
      data: {
        indentNo,
        createdBy,
        departmentId,
        remarks,
        items: {
          create: items.map((item) => ({
            genericNameId: Number(item.genericNameId),
            dosageFormId: item.dosageFormId ? Number(item.dosageFormId) : null, // <-- added
            unitId: item.unitId ? Number(item.unitId) : null, // <-- added
            requestedQty: item.requestedQty,
            lastPurchaseRate: item.lastPurchaseRate || null,
            remarks: item.remarks || null,
            medicineId: item.medicineId || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Indent created successfully", indent: newIndent });
  } catch (error) {
    console.error("createIndent error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Get all indents
 */
const getAllIndents = async (req, res) => {
  try {
    const indents = await prisma.indent.findMany({
      include: {
        items: {
          include: { medicine: true, genericName: true },
        },
        createdByUser: true, // include user who created the indent
      },
      orderBy: { indentDate: "desc" },
    });

    return res.json(indents);
  } catch (error) {
    console.error("getAllIndents error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllIndentWithPagination = async (req, res) => {
  try {
    // 1. Get pagination params from query
    const { page, limit, skip } = getPagination(req.query);

    // 2. Count total indents
    const total = await prisma.indent.count();

    // 3. Fetch indents with pagination
    const indents = await prisma.indent.findMany({
      include: {
        items: {
          include: { medicine: true, genericName: true },
        },
        createdByUser: true, // include user who created the indent
      },
      orderBy: { indentDate: "desc" },
      skip: skip,
      take: limit,
    });

    // 4. Build pagination response
    const pagination = buildPaginationResponse(
      total,
      page,
      limit,
      indents.length,
    );

    // 5. Return response
    return res.json({
      data: indents,
      pagination,
    });
  } catch (error) {
    console.error("getAllIndentWithPagination error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Get Indent by ID
 */
const getIndentById = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const indent = await prisma.indent.findUnique({
      where: { id },
      include: {
        items: {
          where: {
            isPoCreated: false, // ⭐ ONLY REMAINING MEDICINES
          },
          include: {
            medicine: true,
            dosageForm: true,
            unit: true,
          },
        },
      },
    })

    if (!indent) {
      return res.status(404).json({ message: "Indent not found" })
    }

    res.json(indent)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Approve / Update Indent
 */
const approveIndent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, items } = req.body;

    if (
      !["APPROVED", "REJECTED", "PARTIALLY_APPROVED", "PROCESSING"].includes(
        status,
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update indent header
    const updatedIndent = await prisma.indent.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedBy: approvedBy || null,
        approvedAt: approvedBy ? new Date() : null,
        items: items
          ? {
              update: items.map((item) => ({
                where: { id: item.id },
                data: {
                  approvedQty: item.approvedQty,
                  pendingQty: item.pendingQty,
                  remarks: item.remarks || undefined,
                },
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    return res.json({
      message: "Indent updated successfully",
      indent: updatedIndent,
    });
  } catch (error) {
    console.error("approveIndent error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Delete Indent
 */
const deleteIndent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.indentItem.deleteMany({ where: { indentId: parseInt(id) } });
    await prisma.indent.delete({ where: { id: parseInt(id) } });

    return res.json({ message: "Indent deleted successfully" });
  } catch (error) {
    console.error("deleteIndent error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export {
  createIndent,
  getAllIndents,
  getIndentById,
  approveIndent,
  deleteIndent,
  getAllIndentWithPagination,
};
