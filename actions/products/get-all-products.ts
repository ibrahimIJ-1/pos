"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { decimalToNumber } from "@/lib/utils";

export const getAllProducts = async () => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    const products = await prisma.product.findMany({
      include: {
        BranchProduct: {
          include:{
            branch:true
          }
        },
      },
      orderBy: { name: "asc" },
    });

    // Convert Decimal fields to numbers

    return decimalToNumber(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};
