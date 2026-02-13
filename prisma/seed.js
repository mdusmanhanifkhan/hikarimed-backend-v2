import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function ensureRole(name, description, permissions) {
  try {
    let role = await prisma.role.findUnique({ where: { name } });
    if (!role) {
      role = await prisma.role.create({
        data: { name, description, ...permissions },
      });
      console.log(`Created role: ${name}`);
    } else {
      role = await prisma.role.update({
        where: { name },
        data: { description, ...permissions },
      });
      console.log(`Updated role: ${name}`);
    }
    return role;
  } catch (error) {
    console.error(`Error in ensureRole(${name}):`, error);
    throw error;
  }
}

async function ensureUser(email, name, password, roleId) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, password: hashedPassword, roleId },
      });
      console.log(`Created user: ${email}`);
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword, roleId },
      });
      console.log(`Updated user: ${email}`);
    }
    return user;
  } catch (error) {
    console.error(`Error in ensureUser(${email}):`, error);
    throw error;
  }
}

async function main() {
  try {
    const adminRole = await ensureRole("superadmin", "Full system access", {
      canManageDepartments: true,
      canManageDoctors: true,
      canManagePatients: true,
      canManagePatientsHistory: true,
      canManageWelfare: true,
      canManageProcedures: true,
      canManageFees: true,
      canViewReports: true,
      canManageFinanceReport: true,
      canManageToken: true,
      canManagePharma: false,
      canManageAccounts: true,
      canManageOrganization: true,
      canManageSetting: true,
    });

    const patientRole = await ensureRole(
      "patientManager",
      "Can manage patients only",
      {
        canManageDepartments: false,
        canManageDoctors: false,
        canManagePatients: true,
        canManagePatientsHistory: true,
        canManageWelfare: false,
        canManageProcedures: false,
        canManageFees: false,
        canViewReports: true,
        canManageToken: true,
        canManageFinanceReport: true,
        canManageSetting: true,
      },
    );

    const pharmacyRole = await ensureRole(
      "pharmaManager",
      "Can manage pharma only",
      {
        canManageDepartments: false,
        canManageDoctors: false,
        canManagePatients: false,
        canManagePatientsHistory: false,
        canManageWelfare: false,
        canManageProcedures: false,
        canManageFees: false,
        canViewReports: false,
        canManageToken: false,
        canManagePharma: true,
        canManageAccounts: false,
        canManageSetting:false
      },
    );

    await ensureUser(
      "superadmin@system.com",
      "Super Admin",
      "superadmin@01",
      adminRole.id,
    );
    await ensureUser(
      "developer@system.com",
      "Developer",
      "developer@khan",
      patientRole.id,
    );
    await ensureUser(
      "sharjeel.baig@system.com",
      "Sharjeel Baig",
      "sharjeel.baig@system",
      patientRole.id,
    );
    await ensureUser(
      "faisal.ghani@system.com",
      "Faisal Ghani",
      "faisalghani@system",
      patientRole.id,
    );
    await ensureUser(
      "miraj.arif@system.com",
      "Miraj Arif",
      "miraj@system",
      patientRole.id,
    );
    await ensureUser(
      "sidra@system.com",
      "Sidra",
      "sidra@system",
      patientRole.id,
    );
    await ensureUser(
      "hiraqaiser@system.com",
      "Hira Qaiser",
      "hiraqaiser@system",
      patientRole.id,
    );
    await ensureUser(
      "aniba@system.com",
      "Aniba",
      "aniba@system",
      patientRole.id,
    );
    await ensureUser(
      "pharma@system.com",
      "Pharmacy",
      "pharma",
      pharmacyRole.id,
    );

    // ===== SUPER DEVELOPERS (3) =====
    await ensureUser(
      "superdev1@system.com",
      "Super Developer 1",
      "superdev@01",
      adminRole.id,
    );

    await ensureUser(
      "superdev2@system.com",
      "Super Developer 2",
      "superdev@02",
      adminRole.id,
    );

    await ensureUser(
      "superdev3@system.com",
      "Super Developer 3",
      "superdev@03",
      adminRole.id,
    );

    // ===== OWNER (1) =====
    await ensureUser(
      "owner@system.com",
      "System Owner",
      "owner@01",
      patientRole.id,
    );

    // ===== PHARMACY SALE (1) =====
    await ensureUser(
      "pharmacysale@system.com",
      "Pharmacy Sale",
      "pharmasale@01",
      pharmacyRole.id,
    );

    // ===== PHARMACY HOD (1) =====
    await ensureUser(
      "pharmacyhod@system.com",
      "Pharmacy HOD",
      "pharmahod@01",
      pharmacyRole.id,
    );

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
