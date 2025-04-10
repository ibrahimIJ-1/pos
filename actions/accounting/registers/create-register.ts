"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const createRegister = async (
  macAddress: string,
  name: string,
  openingBalance = 0,
  branchId: string
) => {
  //   if (!req.user?.roles.some((role) => ["admin", "manager"].includes(role))) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to create registers" });
  //   }

  try {
    if (!name) {
      throw new Error("Register name is required");
    }
    if (!branchId) {
      throw new Error("Branch is required");
    }

    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);

    const register = await prisma.register.create({
      data: {
        id: macAddress,
        name,
        status: "CLOSED",
        openingBalance: openingBalance || 0,
        branchId: branchId,
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return decimalToNumber(register);
  } catch (error) {
    console.error("Error creating register:", error);
    throw new Error("Failed to create register");
  }
};
