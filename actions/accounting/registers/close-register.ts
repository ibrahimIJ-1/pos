"use server";

import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const closeRegister = async (id: string, closingBalance: number) => {
  const userId = (await checkUser()).id;
  await checkUserPermissions(rolePermissions[UserRole.ACCOUNTANT]);
  if (!id || typeof id !== "string") {
    throw new Error("Invalid register ID");
  }

  try {
    if (closingBalance === undefined) {
      throw new Error("Closing balance is required");
    }

    // Check if register exists and is open
    const register = await prisma.register.findUnique({
      where: { id },
    });

    if (!register) {
      throw new Error("Register not found");
    }

    if (register.status !== "OPEN") {
      throw new Error("Register is not open");
    }

    // Calculate expected balance
    const transactions = await prisma.registerTransaction.findMany({
      where: {
        registerId: id,
        created_at: {
          gte: register.openedAt!,
        },
      },
    });

    let expectedBalance = register.openingBalance.toNumber();

    for (const transaction of transactions) {
      if (["SALE", "CASH_IN"].includes(transaction.type)) {
        expectedBalance += Number(transaction.amount);
      } else if (["REFUND", "EXPENSE", "CASH_OUT"].includes(transaction.type)) {
        expectedBalance -= Number(transaction.amount);
      }
    }

    // Close the register
    const updatedRegister = await prisma.register.update({
      where: { id },
      data: {
        status: "CLOSED",
        currentCashierId: null,
        closingBalance: closingBalance,
        closedAt: new Date(),
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
    if (closingBalance > 0)
      // Create a transaction record for closing the register
      await prisma.registerTransaction.create({
        data: {
          registerId: id,
          type: "CASH_OUT",
          amount: closingBalance,
          paymentMethod: "CASH",
          description: "Register closed",
          cashierId: userId,
        },
      });

    return {
      register: decimalToNumber(updatedRegister),
      expectedBalance,
      difference: closingBalance - expectedBalance,
    };
  } catch (error) {
    console.error(`Error closing register ${id}:`, error);
    throw new Error("Failed to close register");
  }
};
