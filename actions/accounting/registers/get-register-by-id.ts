"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const getRegisterById = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    const register = await prisma.register.findUnique({
      where: { id },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!register) throw new Error("No transaction found...");

    return register;
  } catch (error) {
    console.error("Error fetching registers:", error);
    throw new Error("Failed to fetch registers");
  }
};
