"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { Discount } from "@prisma/client";

export const createNewDiscount = async ({
  name,
  code,
  type,
  value,
  minPurchaseAmount,
  appliesTo,
  productIds,
  categoryIds,
  buyXQuantity,
  getYQuantity,
  startDate,
  endDate,
  maxUses,
  isActive,
}: Discount & { productIds?: string[] }) => {
  console.log({
    name,
    code,
    type,
    value,
    minPurchaseAmount,
    appliesTo,
    productIds,
    categoryIds,
    buyXQuantity,
    getYQuantity,
    startDate,
    endDate,
    maxUses,
    isActive,
  });

  try {
    
    // Validate required fields
    if (!name || !type || value === undefined || !appliesTo || !startDate) {
      throw new Error("Missing required discount fields");
    }

    // Check if discount with code already exists (if code provided)
    if (code) {
      const existingDiscount = await prisma.discount.findUnique({
        where: { code },
      });

      if (existingDiscount) {
        throw new Error("Discount with this code already exists");
      }
    }

    // Create the discount
    const discount = await prisma.discount.create({
      data: {
        name,
        code,
        type,
        value: value,
        minPurchaseAmount: minPurchaseAmount ? minPurchaseAmount : null,
        appliesTo,
        categoryIds: categoryIds || null,
        buyXQuantity: buyXQuantity ? buyXQuantity : null,
        getYQuantity: getYQuantity ? getYQuantity : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxUses: maxUses ? maxUses : null,
        currentUses: 0,
        isActive: isActive !== undefined ? isActive : true,
        products:
          productIds && productIds.length > 0
            ? {
                connect: productIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return decimalToNumber(discount);
  } catch (error) {
    console.error("Error creating discount:", error);
    throw new Error("Failed to create discount");
  }
};
