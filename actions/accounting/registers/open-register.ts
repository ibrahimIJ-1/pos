"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const openRegister = async (id: string, openingBalance = 0) => {
  await checkUserPermissions(rolePermissions[UserRole.ACCOUNTANT]);

  if (!id || typeof id !== "string") {
    throw new Error("Invalid register ID");
  }

  try {
    if (openingBalance === undefined) {
      throw new Error("Opening balance is required");
    }

    // Check if register exists and is closed
    const register = await prisma.register.findUnique({
      where: { id },
    });

    if (!register) {
      throw new Error("Register not found");
    }

    if (register.status === "OPEN") {
      throw new Error("Register is already open");
    }

    // Open the register
    const updatedRegister = await prisma.register.update({
      where: { id },
      data: {
        status: "OPEN",
        //TODO Cashier ID
        currentCashierId: "1",
        openingBalance: openingBalance,
        openedAt: new Date(),
        closedAt: null,
        closingBalance: null,
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

    // Create a transaction record for opening the register
    await prisma.registerTransaction.create({
      data: {
        registerId: id,
        type: "CASH_IN",
        amount: openingBalance,
        paymentMethod: "CASH",
        description: "Register opened",
        //TODO GET THE USER ID
        cashierId: "1",
      },
    });

    return updatedRegister;
  } catch (error) {
    console.error(`Error opening register ${id}:`, error);
    throw new Error("Failed to open register");
  }
};
