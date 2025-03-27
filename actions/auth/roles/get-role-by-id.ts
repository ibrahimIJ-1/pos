"use server";

import { prisma } from "@/lib/prisma";

export const getRoleById = async (id: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  } catch (error) {
    console.error(`Error fetching role ${id}:`, error);
    throw new Error("Failed to fetch role");
  }
};
