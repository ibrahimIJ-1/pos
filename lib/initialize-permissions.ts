// @ts-nocheck

import { Permission, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * Initialize the database with default permissions and roles.
 * This should be called during application startup.
 */
export async function initializePermissions() {
  try {
    console.log("Initializing permissions and roles...");
    
    // Create permissions
    for (const permission of Object.values(Permission)) {
      await prisma.permission.upsert({
        where: { name: permission },
        update: {}, // No updates needed
        create: { name: permission },
      });
    }
    
    // Create roles with their permissions
    for (const [roleName, permissions] of Object.entries(UserRole)) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {}, // Don't update existing role names
        create: { name: roleName },
      });
      
      // Connect permissions to the role
      // First get all the permission objects
      const permissionRecords = await prisma.permission.findMany({
        where: {
          name: {
            in: permissions,
          },
        },
      });
      
      // Then connect them to the role
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: permissionRecords.map(p => ({ id: p.id })),
          },
        },
      });
    }
    
    console.log("Permissions and roles initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize permissions and roles:", error);
    throw error;
  }
}
