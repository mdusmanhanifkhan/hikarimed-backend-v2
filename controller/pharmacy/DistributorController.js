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

const validateDistributorInput = (data) => {
  const errors = {};
  const missingFields = [];

  const { name, contactPerson, mobile, email, openingBalance, companyIds } =
    data;

  // Required checks
  if (!name || name.trim() === "") missingFields.push("Name is required.");
  if (!contactPerson || contactPerson.trim() === "")
    missingFields.push("Contact Person is required");
  if (!mobile || mobile.trim() === "")
    missingFields.push("Mobile is required.");
  if (
    openingBalance === undefined ||
    openingBalance === null ||
    isNaN(openingBalance)
  ) {
    missingFields.push("Opening Balance is required.");
  }
  // Format checks
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Invalid email address";
  }

  // Company validation
  if (!Array.isArray(companyIds) || companyIds.length === 0) {
    errors.companyIds = "At least one company must be selected";
  }

  return { errors, missingFields };
};

/**
 * CREATE DISTRIBUTOR
 */
export const createDistributor = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phone,
      mobile,
      email,
      website,
      status,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      ntnNumber,
      gstNumber,
      drugLicenseno,
      registrationNo,
      openingBalance,
      balanceType,
      creditLimit,
      paymentTerms,
      bankName,
      bankAccountNo,
      iban,
      remarks,
      companyIds,
    } = req.body;

    // 🔍 Validate input
    const { errors, missingFields } = validateDistributorInput(req.body);

    if (missingFields.length > 0) {
      return sendError(res, 400, "Missing required fields", { missingFields });
    }

    if (Object.keys(errors).length > 0) {
      return sendError(res, 400, "Validation failed", errors);
    }

    // ✅ Create distributor
    // Step 1: Create distributor without companies
    const distributor = await prisma.distributor.create({
      data: {
        name,
        contactPerson,
        phone,
        mobile,
        email,
        website,
        status,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        ntnNumber,
        gstNumber,
        drugLicenseno,
        registrationNo,
        openingBalance,
        balanceType,
        creditLimit,
        paymentTerms,
        bankName,
        bankAccountNo,
        iban,
        remarks,
      },
    });

    // Step 2: Connect companies (only valid IDs)
    if (companyIds && companyIds.length > 0) {
      const companyIdsNumeric = companyIds.map((id) => Number(id));

      const validCompanies = await prisma.company.findMany({
        where: { id: { in: companyIdsNumeric } },
        select: { id: true },
      });

      if (validCompanies.length > 0) {
        await prisma.distributor.update({
          where: { id: distributor.id },
          data: {
            companies: {
              connect: validCompanies.map((c) => ({ id: c.id })),
            },
          },
        });
      }
    }

    return res.json({
      success: true,
      message: "Distributor created successfully",
      data: distributor,
    });
  } catch (error) {
    console.error(error);

    return sendError(res, 500, "Failed to create distributor", {});
  }
};

export const getAllDistributors = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await prisma.distributor.count();

    const distributors = await prisma.distributor.findMany({
      skip,
      take: limit,
      include: {
        companies: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pagination = buildPaginationResponse(total, page, limit, distributors.length);

    return res.status(200).json({
      success: true,
      ...pagination,
      data: distributors,
    });
  } catch (error) {
    console.error("Error fetching distributors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch distributors",
      error: error.message || "Internal Server Error",
    });
  }
};


export const getDistributorById = async (req, res) => {
  try {
    const { id } = req.params;

    const distributor = await prisma.distributor.findUnique({
      where: { id: Number(id) },
      include: {
        companies: true,
      },
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "Distributor not found",
      });
    }

    res.json({
      success: true,
      data: distributor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch distributor",
    });
  }
};

export const updateDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyIds, ...data } = req.body;

    const distributor = await prisma.distributor.update({
      where: { id: Number(id) },
      data: {
        ...data,

        // 🔹 reset & reconnect companies
        companies: companyIds
          ? {
              set: [],
              connect: companyIds.map((cid) => ({ id: Number(cid) })),
            }
          : undefined,
      },
      include: {
        companies: true,
      },
    });

    res.json({
      success: true,
      message: "Distributor updated successfully",
      data: distributor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update distributor",
    });
  }
};

export const deleteDistributor = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.distributor.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Distributor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete distributor",
    });
  }
};
