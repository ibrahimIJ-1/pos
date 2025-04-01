"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "./check-permissions";

export const getUserById = async (id: string) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        active: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        additionalPermissions: {
          include: {
            permission: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw new Error("Failed to fetch user");
  }
};
