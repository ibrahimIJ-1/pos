"use server";

import { prisma } from "@/lib/prisma";

export const updateRole = async (
  id: string,
  name: string,
  permissions: string[]
) => {
  try {
    if (!permissions || !Array.isArray(permissions)) {
      throw new Error("Permissions array is required");
    }

    // Update the role
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: name, // Allow updating name
        permissions: {
          set: [], // First disconnect all permissions
          connect: permissions.map((permission: string) => ({
            name: permission,
          })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return role;
  } catch (error) {
    console.error(`Error updating role ${id}:`, error);
    throw new Error("Failed to update role");
  }
};
