import { prisma } from "../../lib/prisma.js";
import { buildPaginationResponse, getPagination } from "../../utils/pagination.js";

const sendError = (res, status, general_error, errors = {}) => {
  return res.status(status).json({
    success: false,
    status,
    general_error,
    errors,
  });
};

const validateSupplierInput = (data) => {
  const errors = {};
  const missingFields = [];

  const { name, contactPerson, phone, openingBalance } = data;

  // Required checks
  if (!name || name.trim() === "") missingFields.push("Name is required.");
  if (!contactPerson || contactPerson.trim() === "")
    missingFields.push("Contact Person is required");
  if (!phone || phone.trim() === "") missingFields.push("Phone is required.");
  if (
    openingBalance === undefined ||
    openingBalance === null ||
    isNaN(openingBalance)
  ) {
    missingFields.push("Opening Balance is required.");
  }

  return { errors, missingFields };
};

/**
 * CREATE SUPPLIER
 */
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      city,
      country,
      openingBalance,
      creditLimit,
      paymentTerms,
      isActive,
    } = req.body;

    // 🔍 Validate input
    const { errors, missingFields } = validateSupplierInput(req.body);

    if (missingFields.length > 0) {
      return sendError(res, 400, "Missing required fields", { missingFields });
    }

    if (Object.keys(errors).length > 0) {
      return sendError(res, 400, "Validation failed", errors);
    }

    // ✅ Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        phone,
        email,
        address,
        city,
        country: country || "Pakistan",
        openingBalance,
        creditLimit,
        paymentTerms,
        isActive: isActive ?? true,
      },
    });

    return res.json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to create supplier", {});
  }
};

/**
 * GET ALL SUPPLIERS
 */
export const getAllSuppliers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await prisma.supplier.count();

    const suppliers = await prisma.supplier.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const pagination = buildPaginationResponse(total, page, limit, suppliers.length);

    return res.status(200).json({
      success: true,
      ...pagination,
      data: suppliers,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
      error: error.message || "Internal Server Error",
    });
  }
};

/**
 * GET SUPPLIER BY ID
 */
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
      include: {
        purchaseOrders: true,
        goodsReceipts: true,
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to fetch supplier");
  }
};

/**
 * UPDATE SUPPLIER
 */
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data,
    });

    return res.json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to update supplier");
  }
};

/**
 * DELETE SUPPLIER
 */
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to delete supplier");
  }
};