"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUserPermissions } from "../users/check-permissions";
import { uploadFile } from "../tools/s3-bucket-uploader";
import { BranchProduct } from "@prisma/client";
import { getAllUserBranches } from "../branches/get-user-all-branches";

export const updateProduct = async ({
  id,
  name,
  description,
  sku,
  barcode,
  category,
  image_url,
  image_file,
  branches,
}: {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category?: string;
  image_url?: string;
  image_file?: File | null;
  branches: any[];
}) => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    const userBranches = await getAllUserBranches();
    if (image_file) {
      image_url = await uploadFile(image_file, true);
    }

    const incomingBranchIds = branches.map((b) => b.branchId);
    const result = await prisma.$transaction(async (tx) => {
      for (const branch of branches) {
        await prisma.branchProduct.upsert({
          where: {
            productId_branchId: {
              productId: id,
              branchId: branch.branchId,
            },
          },
          update: {
            price: branch.price,
            cost: branch.cost,
            taxRate: branch.taxRate,
            stock: branch.stock,
            low_stock_threshold: branch.low_stock_threshold,
            isActive: branch.isActive,
          },
          create: {
            product: { connect: { id: id } },
            branch: { connect: { id: branch.branchId } },
            price: branch.price,
            cost: branch.cost,
            taxRate: branch.taxRate,
            stock: branch.stock,
            low_stock_threshold: branch.low_stock_threshold,
            isActive: branch.isActive,
          },
        });
      }

      // 3. Delete removed branches
      await prisma.branchProduct.deleteMany({
        where: {
          productId: id,
          branchId: {
            notIn: incomingBranchIds,
            in: userBranches.branches.map((branch) => branch.id),
          },
        },
      });
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          sku,
          description,
          barcode,
          category,
          image_url,
        },
      });
      return product;
    });
    return decimalToNumber(result);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw new Error("Failed to update product");
  }
};
