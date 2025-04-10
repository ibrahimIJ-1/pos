"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getProductById = async (id: string) => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        BranchProduct: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw new Error("Failed to fetch product");
  }
};
