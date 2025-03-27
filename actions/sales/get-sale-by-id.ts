"use server";

import { prisma } from "@/lib/prisma";

export const getSaleById = async (id: string) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                image_url: true,
              },
            },
          },
        },
        discountsApplied: {
          include: {
            discount: true,
          },
        },
        register: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found");
    }

    return sale;
  } catch (error) {
    console.error(`Error fetching sale ${id}:`, error);
    throw new Error("Failed to fetch sale");
  }
};
