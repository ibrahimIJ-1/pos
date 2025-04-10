"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUserPermissions } from "../users/check-permissions";
import { uploadFile } from "../tools/s3-bucket-uploader";
import { BranchProduct } from "@prisma/client";

export const createNewProduct = async ({
  name,
  description,
  sku,
  barcode,
  category,
  image_file,
  branches,
}: {
  name: string;
  description?: string;
  sku: string;
  barcode?: string | null;
  category?: string;
  image_url?: string | null;
  image_file?: File | null;
  branches: BranchProduct[];
}) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    // Validate required fields
    if (!branches || branches.length < 1)
      throw new Error("Missing required product fields");

    // Check if product with SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new Error("Product with this SKU already exists");
    }
    let url: string | null = null;
    if (image_file) {
      url = await uploadFile(image_file);
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        sku,
        barcode,
        category: category || "Uncategorized",
        image_url: url,
        BranchProduct: {
          create: branches.map((branch) => ({
            branch: {
              connect: { id: branch.branchId },
            },
            price: branch.price,
            cost: branch.cost,
            taxRate: branch.taxRate,
            stock: branch.stock,
            low_stock_threshold: branch.low_stock_threshold,
            isActive: branch.isActive,
          })),
        },
      },
    });

    return decimalToNumber(product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};
