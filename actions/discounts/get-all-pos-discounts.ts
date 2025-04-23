"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { checkUser } from "../Authorization";
import { getRegisterById } from "../accounting/registers/get-register-by-id";

export const getAllPOSDiscounts = async () => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.ACCOUNTANT],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    let user = await checkUser();
    const reg = await getRegisterById(user.macAddress);
    const today = new Date();
    const discounts = await prisma.discount.findMany({
      where: {
        branches: {
          some: {
            id: reg.branchId,
          },
        },
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
        isActive: true,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: true,
      },
      orderBy: { name: "asc" },
    });

    const formattedDiscounts = discounts.map((discount) => ({
      ...discount,
      value: discount.value.toNumber(), // Convert Decimal to number
      minPurchaseAmount: discount.minPurchaseAmount
        ? discount.minPurchaseAmount.toNumber()
        : null, // Convert Decimal to number or null
    }));

    return formattedDiscounts;
  } catch (error) {
    console.error("Error fetching discounts:", error);
    throw new Error("Failed to fetch discounts");
  }
};
