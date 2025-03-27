"use server";

import { Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const createNewRole = async (name: string, permissions:Permission[]) => {
  try {
    if (!name) {
      throw new Error("Role name is required");
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new Error("Role with this name already exists");
    }

    // Create the role with permissions if provided
    const role = await prisma.role.create({
      data: {
        name,
        permissions:
          permissions && permissions.length > 0
            ? {
                connect: permissions.map((permission: string) => ({
                  name: permission,
                })),
              }
            : undefined,
      },
      include: {
        permissions: true,
      },
    });

    return role;
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error("Failed to create role");
  }
};
