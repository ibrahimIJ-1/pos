"use server";

import { prisma } from "@/lib/prisma";

export const getUserAdditionalPermissions = async (id: string) => {
  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: id },
      include: {
        permission: true,
      },
    });

    return userPermissions.map((up) => up.permission);
  } catch (error) {
    console.error(`Error fetching user permissions ${id}:`, error);
    throw new Error("Failed to fetch user permissions");
  }
};
