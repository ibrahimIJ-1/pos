"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUserPermissions } from "../users/check-permissions";

export const createNewProduct = async ({
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
}: {
  name: string;
  description?: string;
  sku: string;
  barcode?: string | null;
  price: any;
  cost: any;
  category?: string;
  taxRate: any;
  stock?: any;
  low_stock_threshold?: any;
  image_url?: string | null;
}) => {
  try {
await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    // Validate required fields
    if (!name || !sku || price === undefined || cost === undefined) {
      throw new Error("Missing required product fields");
    }

    // Check if product with SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new Error("Product with this SKU already exists");
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        sku,
        barcode,
        price: price,
        cost: cost,
        category: category || "Uncategorized",
        taxRate: taxRate || 0,
        stock: stock || 0,
        low_stock_threshold: low_stock_threshold || 0,
        // image_url,
        active: true,
      },
    });

    return decimalToNumber(product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};
