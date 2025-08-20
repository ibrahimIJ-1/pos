"use server";

import { getAllUserBranches } from "@/actions/branches/get-user-all-branches";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getAllRegisterTransactions = async () => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    const userBranches = await getAllUserBranches();
    if (userBranches.branchId === null)
      throw new Error("User has no branch selected");
    const registers = await prisma.registerTransaction.findMany({
      where: {
        branchId: userBranches.branchId,
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Ensure created_at is a valid Date object and format it
    const formattedRegisters = registers.map((register) => ({
      ...register,
      created_at: register.created_at
        ? new Date(register.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19) // Format: YYYY-MM-DD HH:mm:ss
        : null, // Handle null cases
    }));

    return decimalToNumber(formattedRegisters);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};
