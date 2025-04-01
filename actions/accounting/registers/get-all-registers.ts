"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

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
      },
      orderBy: { name: "asc" },
    });

    return registers;
  } catch (error) {
    console.error("Error fetching registers:", error);
    throw new Error("Failed to fetch registers");
  }
};
