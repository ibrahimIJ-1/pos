"use server";

import { prisma } from "@/lib/prisma";

export const getProductById = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
