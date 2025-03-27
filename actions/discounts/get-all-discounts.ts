"use server";

import { prisma } from "@/lib/prisma";

export const getAllDiscounts = async () => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
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
