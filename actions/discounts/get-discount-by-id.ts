"use server";

import { prisma } from "@/lib/prisma";

export const getDiscountById = async (id: string) => {
  try {
    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
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
