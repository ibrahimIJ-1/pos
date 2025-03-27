"use server";

import { prisma } from "@/lib/prisma";

export const updateUserAdditionalPermissions = async (
  id: string,
  permissions: string[]
) => {
  try {
    if (!permissions || !Array.isArray(permissions)) {
      throw new Error("Permissions array is required");
    }

    // First delete all existing additional permissions
    await prisma.userPermission.deleteMany({
      where: { userId: id },
    });

    // Then add the new ones
    if (permissions.length > 0) {
      const permissionsToAdd = await Promise.all(
        permissions.map(async (permName: string) => {
          const permission = await prisma.permission.findUnique({
            where: { name: permName },
          });

          if (!permission) {
            throw new Error(`Permission "${permName}" not found`);
          }

          return {
            userId: id,
            permissionId: permission.id,
          };
        })
      );

      await prisma.userPermission.createMany({
        data: permissionsToAdd,
      });
    }

    // Get updated user with permissions
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
        additionalPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error(`Error updating user permissions ${id}:`, error);
    throw new Error("Failed to update user permissions");
  }
};
