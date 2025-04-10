"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getDiscountById = async (id: string) => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.ACCOUNTANT],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: true,
      },
    });

    if (!discount) {
      throw new Error("Discount not found");
    }

    return discount;
  } catch (error) {
    console.error(`Error fetching discount ${id}:`, error);
    throw new Error("Failed to fetch discount");
  }
};
