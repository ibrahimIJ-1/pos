"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const checkDiscountById = async (id: string) => {
  try {
    const today = new Date();
    const discount = await prisma.discount.findUnique({
      where: {
        id,
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
        isActive:true
      },
    });

    return discount ? true : false;
  } catch (error) {
    console.error("Error fetching discounts:", error);
    throw new Error("Failed to fetch discounts");
  }
};
