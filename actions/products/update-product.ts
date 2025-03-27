"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const updateProduct = async ({
  id,
  name,
  description,
  sku,
  barcode,
  price,
  cost,
  category,
  taxRate,
  stock,
  low_stock_threshold,
  image_url,
  active,
}: {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  category?: string;
  taxRate?: number;
  stock?: number;
  low_stock_threshold?: number;
  image_url?: string;
  active?: boolean;
}) => {
  // Check if user has permission to edit products
  //   if (
  //     !req.user?.roles.includes("admin") &&
  //     !req.user?.roles.includes("manager") &&
  //     !req.user?.roles.includes("inventory_clerk")
  //   ) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to edit products" });
  //   }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        barcode,
        price: price,
        cost: cost,
        category,
        taxRate: taxRate ?? 0,
        stock: stock ?? 0,
        low_stock_threshold: low_stock_threshold ?? 0,
        image_url,
        active: active !== undefined ? active : true,
      },
    });

    return decimalToNumber(product);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw new Error("Failed to update product");
  }
};
