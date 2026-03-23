import { prisma } from "../../lib/prisma.js";
import { buildPaginationResponse, getPagination } from "../../utils/pagination.js";

/* ================= HELPERS ================= */
const generateIndentNo = async () => {
  const count = await prisma.indent.count();
  return `IND-${(count + 1).toString().padStart(5, "0")}`;
};

/* ================= CREATE INDENT ================= */
const createIndent = async (req, res) => {
  try {
    const { departmentId, items, remarks } = req.body;
    const userId = req.user?.id;

    if (!departmentId) {
      return res.status(400).json({ message: "Department is required." });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: "At least one item is required." });
    }

    // ✅ Check for duplicate variant per product
    const seenVariants = new Map(); // key: productId, value: Set of variantIds

    for (const item of items) {
      const productId = item.productId;
      const variantId = item.variantId || ''; // allow null/empty variant

      if (!seenVariants.has(productId)) {
        seenVariants.set(productId, new Set());
      }

      const variantsSet = seenVariants.get(productId);
      if (variantsSet.has(variantId)) {
        return res.status(400).json({
          message: `Duplicate variant detected for productId ${productId} with variantId ${variantId}`
        });
      }

      variantsSet.add(variantId);
    }

    const indentNo = await generateIndentNo();

    const newIndent = await prisma.indent.create({
      data: {
        indentNo,
        departmentId: Number(departmentId),
        requestedById: userId,
        status: "OPEN",
        remarks: remarks || null,
        items: {
          create: items.map(item => ({
            productId: Number(item.productId),
            variantId: item.variantId ? Number(item.variantId) : null,
            requestedQty: Number(item.requestedQty),
            approvedQty: null,
            estimatedPrice: item.estimatedPrice || null,
            remarks: item.remarks || null,
            isPoCreated: false,
          })),
        },
      },
      include: {
        items: { include: { product: true, variant: true } },
        requestedBy: true,
        approvedBy: true,
        department: true,
      },
    });

    return res.status(201).json({ message: "Indent created successfully", indent: newIndent });
  } catch (error) {
    console.error("createIndent error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/* ================= GET ALL INDENTS ================= */
const getAllIndents = async (req, res) => {
  try {
    const indents = await prisma.indent.findMany({
      include: {
        items: { include: { product: true, variant: true } },
        requestedBy: true,
        approvedBy: true,
        department: true,
      },
      orderBy: { indentDate: "desc" },
    });

    return res.json(indents);
  } catch (error) {
    console.error("getAllIndents error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/* ================= GET INDENTS WITH PAGINATION ================= */
const getAllIndentWithPagination = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await prisma.indent.count();

    const indents = await prisma.indent.findMany({
      include: {
        items: { include: { product: true, variant: true } },
        requestedBy: true,
        approvedBy: true,
        department: true,
      },
      orderBy: { indentDate: "desc" },
      skip,
      take: limit,
    });

    const pagination = buildPaginationResponse(total, page, limit, indents.length);

    return res.json({ data: indents, pagination });
  } catch (error) {
    console.error("getAllIndentWithPagination error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/* ================= GET INDENT BY ID ================= */
const getIndentById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const indent = await prisma.indent.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        requestedBy: true,
        approvedBy: true,
        department: true,
      },
    });

    if (!indent) return res.status(404).json({ message: "Indent not found" });
    return res.json(indent);
  } catch (error) {
    console.error("getIndentById error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/* ================= UPDATE / APPROVE INDENT ================= */
const approveIndent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, approvedById, items } = req.body;

    const validStatuses = ["PO_CREATED", "CLOSED", "REJECTED"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const updatedIndent = await prisma.indent.update({
      where: { id },
      data: {
        status,
        approvedById: approvedById || null,
        updatedAt: new Date(),
        items: items
          ? {
              update: items.map((item) => ({
                where: { id: item.id },
                data: {
                  approvedQty: item.approvedQty ?? undefined,
                  remarks: item.remarks ?? undefined,
                  isPoCreated: item.isPoCreated ?? undefined,
                },
              })),
            }
          : undefined,
      },
      include: { items: true, requestedBy: true, approvedBy: true, department: true },
    });

    return res.json({ message: "Indent updated successfully", indent: updatedIndent });
  } catch (error) {
    console.error("approveIndent error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/* ================= DELETE INDENT ================= */
const deleteIndent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.indenItem.deleteMany({ where: { indentId: id } });
    await prisma.indent.delete({ where: { id } });

    return res.json({ message: "Indent deleted successfully" });
  } catch (error) {
    console.error("deleteIndent error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const getIndentItemsForPO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Indent ID required" });

    const indent = await prisma.indent.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          where: { isPoCreated: false },
        },
      },
    });

    if (!indent) return res.status(404).json({ message: "Indent not found" });

    res.json({
      id: indent.id,
      indentNo: indent.indentNo,
      items: indent.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        requestedQty: i.requestedQty,
      })),
    });
  } catch (err) {
    console.error("getIndentItemsForPO error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  createIndent,
  getAllIndents,
  getIndentById,
  approveIndent,
  deleteIndent,
  getAllIndentWithPagination,
  getIndentItemsForPO
};