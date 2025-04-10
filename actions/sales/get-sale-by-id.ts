"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getSaleById = async (id: string) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.CASHIER]]);
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
        branch: {
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
        register: {
          select: {
            name: true,
          },
        },
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
