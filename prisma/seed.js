// import bcrypt from "bcryptjs";
// import { prisma } from "../lib/prisma.js";

// async function ensureRole(name, description, permissions) {
//   try {
//     let role = await prisma.role.findUnique({ where: { name } });
//     if (!role) {
//       role = await prisma.role.create({
//         data: { name, description, ...permissions },
//       });
//       console.log(`Created role: ${name}`);
//     } else {
//       role = await prisma.role.update({
//         where: { name },
//         data: { description, ...permissions },
//       });
//       console.log(`Updated role: ${name}`);
//     }
//     return role;
//   } catch (error) {
//     console.error(`Error in ensureRole(${name}):`, error);
//     throw error;
//   }
// }

// async function ensureUser(email, name, password, roleId) {
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     let user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       user = await prisma.user.create({
//         data: { email, name, password: hashedPassword, roleId },
//       });
//       console.log(`Created user: ${email}`);
//     } else {
//       user = await prisma.user.update({
//         where: { email },
//         data: { name, password: hashedPassword, roleId },
//       });
//       console.log(`Updated user: ${email}`);
//     }
//     return user;
//   } catch (error) {
//     console.error(`Error in ensureUser(${email}):`, error);
//     throw error;
//   }
// }

// async function main() {
//   try {
//     const adminRole = await ensureRole("superadmin", "Full system access", {
//       canManageDepartments: true,
//       canManageDoctors: true,
//       canManagePatients: true,
//       canManagePatientsHistory: true,
//       canManageWelfare: true,
//       canManageProcedures: true,
//       canManageFees: true,
//       canViewReports: true,
//       canManageFinanceReport: true,
//       canManageToken: true,
//       canManagePharma: false,
//       canManageAccounts: true,
//       canManageOrganization: true,
//       canManageSetting: true,
//     });

//     const patientRole = await ensureRole(
//       "patientManager",
//       "Can manage patients only",
//       {
//         canManageDepartments: false,
//         canManageDoctors: false,
//         canManagePatients: true,
//         canManagePatientsHistory: true,
//         canManageWelfare: false,
//         canManageProcedures: false,
//         canManageFees: false,
//         canViewReports: true,
//         canManageToken: true,
//         canManageFinanceReport: true,
//         canManageSetting: true,
//       },
//     );

//     const pharmacyRole = await ensureRole(
//       "pharmaManager",
//       "Can manage pharma only",
//       {
//         canManageDepartments: false,
//         canManageDoctors: false,
//         canManagePatients: false,
//         canManagePatientsHistory: false,
//         canManageWelfare: false,
//         canManageProcedures: false,
//         canManageFees: false,
//         canViewReports: false,
//         canManageToken: false,
//         canManagePharma: true,
//         canManageAccounts: false,
//         canManageSetting: false,
//       },
//     );

//     // ===== ADMIN =====
//     await ensureUser(
//       "superadmin@system.com",
//       "Super Admin",
//       "superadmin@01",
//       adminRole.id,
//     );

//     // ===== DEVELOPERS =====
//     await ensureUser(
//       "developer@system.com",
//       "Developer",
//       "developer@khan",
//       patientRole.id,
//     );

//     // ===== RECEPTION / STAFF =====
//     await ensureUser(
//       "reception@system.com",
//       "Reception",
//       "reception@01",
//       patientRole.id,
//     );
//     await ensureUser(
//       "reception01@system.com",
//       "Reception One",
//       "reception01@01",
//       patientRole.id,
//     );
//     await ensureUser(
//       "hassan@system.com",
//       "Hassan",
//       "hassan@system",
//       patientRole.id,
//     );
//     await ensureUser(
//       "ithead@system.com",
//       "IT Head",
//       "ithead@system",
//       patientRole.id,
//     );

//     // ===== PHARMACY =====
//     await ensureUser(
//       "pharma@system.com",
//       "Pharmacy",
//       "pharma@system",
//       pharmacyRole.id,
//     );
//     await ensureUser(
//       "pharmacysale@system.com",
//       "Pharmacy Sale",
//       "pharmasale@system",
//       pharmacyRole.id,
//     );
//     await ensureUser(
//       "pharmacyhod@system.com",
//       "Pharmacy HOD",
//       "pharmahod@system",
//       pharmacyRole.id,
//     );

//     // ===== OTHER INDIVIDUALS =====
//     await ensureUser(
//       "sharjeel.baig@system.com",
//       "Sharjeel Baig",
//       "sharjeel.baig@system",
//       patientRole.id,
//     );
//     await ensureUser(
//       "faisal.ghani@system.com",
//       "Faisal Ghani",
//       "faisal.ghani@system",
//       patientRole.id,
//     );
//     await ensureUser(
//       "miraj.arif@system.com",
//       "Miraj Arif",
//       "miraj.arif@system",
//       patientRole.id,
//     );
//     await ensureUser("sidra@system.com", "Sidra", "sidra@system", patientRole.id);
//     await ensureUser(
//       "hiraqaiser@system.com",
//       "Hira Qaiser",
//       "hiraqaiser@system",
//       patientRole.id,
//     );
//     await ensureUser("aniba@system.com", "Aniba", "aniba@system", patientRole.id);

//     console.log("Seeding completed!");
//   } catch (error) {
//     console.error("Seed failed:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();


import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const allPermissions = [
  { name: "view_dashboard", description: "Access dashboard" },

  // Patient
  { name: "manage_patients", description: "Manage all patients" },
  { name: "manage_token", description: "Manage token system" },
  { name: "manage_patient_history", description: "Access patient history" },
  { name: "manage_nursing", description: "Manage nursing operations" },

  // Hospital
  { name: "manage_departments", description: "Manage all departments" },
  { name: "manage_procedures", description: "Manage medical procedures" },
  { name: "manage_doctors", description: "Manage all doctors" },
  { name: "manage_fees", description: "Manage fees and billing" },
  { name: "manage_welfare", description: "Manage welfare and charity" },
  { name: "manage_organization", description: "Manage organization settings" },

  // Pharmacy
  { name: "manage_brand", description: "Manage medicine brands" },
  { name: "manage_supplier", description: "Manage suppliers" },
  { name: "manage_category", description: "Manage categories" },
  { name: "manage_subcategory", description: "Manage subcategories" },
  { name: "manage_unit", description: "Manage units" },
  { name: "manage_generic", description: "Manage generic medicines" },
  { name: "manage_dosageform", description: "Manage dosage forms" },
  { name: "manage_packing_type", description: "Manage packing types" },

  { name: "manage_product", description: "Manage products/medicines" },
  { name: "manage_stock", description: "Manage stock inventory" },
  { name: "manage_grn", description: "Manage goods received notes" },

  { name: "manage_indent", description: "Manage indent requests" },
  { name: "manage_purchase_order", description: "Manage purchase orders" },
  { name: "manage_approved_pos", description: "Manage approved purchase orders" },
  { name: "manage_send_to_supplier", description: "Send orders to suppliers" },

  { name: "manage_sale", description: "Manage sales" },
  { name: "manage_return", description: "Manage returns" },

  // Reports & Billing
  { name: "view_reports", description: "View all reports" },
  { name: "view_billing", description: "View billing information" },

  // Admin
  { name: "manage_users", description: "Manage users" },
  { name: "manage_roles", description: "Manage roles and permissions" },
  { name: "manage_settings", description: "Manage system settings" },
  { name: "manage_downloads", description: "Manage downloads" },
  { name: "manage_uploads", description: "Manage uploads" },
];

async function ensurePermissions() {
  const permissionRecords = [];
  for (const perm of allPermissions) {
    let record = await prisma.permission.findUnique({ where: { name: perm.name } });
    if (!record) {
      record = await prisma.permission.create({ data: perm });
      console.log(`Created permission: ${perm.name}`);
    } else {
      console.log(`Permission exists: ${perm.name}`);
    }
    permissionRecords.push(record);
  }
  return permissionRecords;
}

async function ensureRole(name, description, permissions) {
  let role = await prisma.role.findUnique({ where: { name } });
  if (!role) {
    role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });
    console.log(`Created role: ${name}`);
  } else {
    console.log(`Role exists: ${name}`);
  }

  // Assign permissions
  for (const perm of permissions) {
    const exists = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: perm.id },
      },
    });
    if (!exists) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
      console.log(`Assigned permission "${perm.name}" to role "${role.name}"`);
    }
  }

  return role;
}

async function ensureUser(email, name, password, roleId) {
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
}

async function main() {
  try {
    // 1️⃣ Create all permissions
    const permissions = await ensurePermissions();

    // 2️⃣ Create developer role and assign all permissions
    const developerRole = await ensureRole("developer", "Full access developer", permissions);

    // 3️⃣ Create developer user
    await ensureUser(
      "developer@system.com",
      "Developer",
      "developer@01",
      developerRole.id
    );

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();