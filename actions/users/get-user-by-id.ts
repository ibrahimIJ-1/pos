"use server";

import { prisma } from "@/lib/prisma";

export const getUserById = async (id: string) => {
  try {
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
