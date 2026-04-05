import { prisma } from "../../lib/prisma.js";
import { buildPaginationResponse, getPagination } from "../../utils/pagination.js";

// --------------------
// CREATE PRODUCT
// --------------------
export const createProduct = async (req, res) => {
  try {
    const {
      status,
      name,
      sku,
      barcode,
      description,
      categoryId,
      brandId,
      isBatchTracked,
      hasExpiry,
      isSerialized,
      requiresColdStorage,
      isActive,
      variants, // Array of variants
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and Category are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        status: status ?? true,
        name,
        sku,
        barcode,
        description,
        categoryId,
        brandId,
        isBatchTracked: isBatchTracked ?? false,
        hasExpiry: hasExpiry ?? false,
        isSerialized: isSerialized ?? false,
        requiresColdStorage: requiresColdStorage ?? false,
        isActive: isActive ?? true,
        variants: variants
          ? {
              create: variants.map((v) => ({
                status: v.status ?? true,
                name: v.name ?? "",
                sku: v.sku ?? "",
                purchasePrice: v.purchasePrice ?? null,
                salePrice: v.salePrice ?? null,
                // Optional stock fields
                minimumStock: v.minimumStock ?? null,
                reorderLevel: v.reorderLevel ?? null,
                maximumStock: v.maximumStock ?? null,
                // Relations
                strengthUnit: v.strengthUnitId
                  ? { connect: { id: v.strengthUnitId } }
                  : undefined,
                packingType: v.packingTypeId
                  ? { connect: { id: v.packingTypeId } }
                  : undefined,
                // Other optional fields
                packQuantity: v.packQuantity ?? null,
                sizeOrType: v.sizeOrType ?? null,
                consumable: v.consumable ?? false,
                ivOrInjection: v.ivOrInjection ?? false,
                requiresColdStorage:
                  v.requiresColdStorage ?? requiresColdStorage ?? false,
                    expiryAlertDays: v.expiryAlertDays ?? 90,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------
// GET PRODUCTS (PAGINATED)
// --------------------
export const getProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await prisma.product.count();

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      include: { category: true, brand: true, variants: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products,
      ...buildPaginationResponse(total, page, limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// --------------------
// GET PRODUCT BY ID
// --------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },

      include: {
        category: {
          include: {
            parent: true,     // 👈 parent category
            children: true,   // 👈 all subcategories
          },
        },

        brand: true,
        genericName: true,

        variants: {
          include: {
            strengthUnit: true,
            packingType: true,
            dosageForm: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ DETERMINE CATEGORY + SUBCATEGORY
    let category = null;
    let subcategory = null;

    if (product.category?.parent) {
      // Means current category is subcategory
      category = product.category.parent;
      subcategory = product.category;
    } else {
      // Means no subcategory selected
      category = product.category;
    }

    return res.json({
      success: true,
      data: {
        ...product,
        category,
        subcategory, // 👈 IMPORTANT
      },
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// --------------------
// UPDATE PRODUCT
// --------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      name,
      sku,
      barcode,
      description,
      categoryId,
      brandId,
      isBatchTracked,
      hasExpiry,
      isSerialized,
      requiresColdStorage,
      isActive,
      variants, // optional array to update or add
    } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        status: status ?? true,
        name,
        sku,
        barcode,
        description,
        categoryId,
        brandId,
        isBatchTracked,
        hasExpiry,
        isSerialized,
        requiresColdStorage,
        isActive,
        variants: variants
          ? {
              deleteMany: {}, // Replace all variants
              create: variants.map((v) => ({
                status: v.status ?? true,
                name: v.name,
                sku: v.sku,
                purchasePrice: v.purchasePrice,
                salePrice: v.salePrice,
                strengthUnitId: v.strengthUnitId ?? null,
                packingTypeId: v.packingTypeId ?? null,
                packQuantity: v.packQuantity ?? null,
                sizeOrType: v.sizeOrType ?? null,
                consumable: v.consumable ?? false,
                ivOrInjection: v.ivOrInjection ?? false,
                requiresColdStorage: v.requiresColdStorage ?? requiresColdStorage ?? false,
              })),
            }
          : undefined,
      },
      include: { category: true, brand: true, variants: true },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------
// DELETE PRODUCT
// --------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.productVariant.deleteMany({ where: { productId: parseInt(id) } });
    await prisma.product.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};