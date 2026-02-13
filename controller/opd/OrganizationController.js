import { prisma } from "../../lib/prisma.js";


// ✅ Add organization
export const addOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, Email, and Phone are required' });
    }

    const org = await prisma.organization.create({
      data: {
        name,
        email,
        phone,
        address,
        status: status ?? true,
      },
    });

    return res.status(201).json({ success: true, organization: org });
  } catch (err) {
    console.error('addOrganization error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add organization' });
  }
};

// ✅ Get all organizations
export const getOrganizations = async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, organizations: orgs });
  } catch (err) {
    console.error('getOrganizations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
  }
};

// ✅ Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    const org = await prisma.organization.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, address, status },
    });

    return res.json({ success: true, organization: org });
  } catch (err) {
    console.error('updateOrganization error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update organization' });
  }
};

// ✅ Delete organization
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.organization.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ success: true, message: 'Organization deleted' });
  } catch (err) {
    console.error('deleteOrganization error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete organization' });
  }
};

