import { prisma } from "../../lib/prisma.js";



// Create a new Company
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      code,
      contactPerson,
      phone,
      email,
      drugRegistrationNo,
      manufacturingLicenseNo,
      ntnNumber,
      gstNumber,
      isActive,
      remarks,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company Name is required",
      });
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name },
          code ? { code } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company already exists",
      });
    }

    const company = await prisma.company.create({
      data: {
        name,
        code,
        contactPerson,
        phone,
        email,
        drugRegistrationNo,
        manufacturingLicenseNo,
        ntnNumber,
        gstNumber,
        isActive: isActive ?? true,
        remarks,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all Companies
export const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: Number(id) },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update a Company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      contactPerson,
      phone,
      email,
      drugRegistrationNo,
      manufacturingLicenseNo,
      ntnNumber,
      gstNumber,
      isActive,
      remarks,
    } = req.body;

    const company = await prisma.company.update({
      where: { id: Number(id) },
      data: {
        name,
        code,
        contactPerson,
        phone,
        email,
        drugRegistrationNo,
        manufacturingLicenseNo,
        ntnNumber,
        gstNumber,
        isActive,
        remarks,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete a Company
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.company.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
