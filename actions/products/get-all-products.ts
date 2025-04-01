"use server"

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getAllProducts = async () => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER],...rolePermissions[UserRole.CASHIER]]);
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    // Convert Decimal fields to numbers
    const serializedProducts = products.map((product) => ({
      ...product,
      taxRate: product.taxRate.toNumber(), 
      cost: product.cost.toNumber(), 
      price: product.price.toNumber(), 
    }));

    return serializedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};
