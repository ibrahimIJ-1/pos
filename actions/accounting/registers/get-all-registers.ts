"use server";

import { getAllUserBranches } from "@/actions/branches/get-user-all-branches";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getAllRegisters = async () => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    const branches = await getAllUserBranches();

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
      where: {
        branch: {
          id: {
            in: branches.branches.map((branch) => branch.id),
          },
          isActive: true,
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
