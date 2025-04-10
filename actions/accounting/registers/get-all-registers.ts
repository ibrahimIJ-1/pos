"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getAllRegisters = async () => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    const registers = await prisma.register.findMany({
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

      orderBy: { name: "asc" },
    });

    return decimalToNumber(registers);
  } catch (error) {
    console.error("Error fetching registers:", error);
    throw new Error("Failed to fetch registers");
  }
};
