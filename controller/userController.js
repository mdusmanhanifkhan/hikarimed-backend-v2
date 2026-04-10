import { prisma } from "../lib/prisma.js";

// Create User
// export const createUser = async (req, res) => {
//   try {
//     const { name, email, password, roleId } = req.body;

//     const user = await prisma.user.create({
//       data: { name, email, password, roleId },
//       include: { role: { include: { permissions: { include: { permission: true } } } } },
//     });

//     res.json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to send errors
const sendError = (res, status, message) => res.status(status).json({ success: false, message });

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    if (!name || !email || !password || !roleId) {
      return sendError(res, 400, "All fields are required");
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    // Optionally generate JWT for the created user
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions.map((rp) => rp.permission.name),
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error during user creation");
  }
};

// List Users
export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get User by ID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, newPassword, roleId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // =========================
    // PASSWORD CHANGE LOGIC
    // =========================
    let updatedPassword = user.password;

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    // =========================
    // UPDATE USER
    // =========================
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        password: updatedPassword,
        roleId: roleId ? Number(roleId) : undefined,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};