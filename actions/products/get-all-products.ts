"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { decimalToNumber } from "@/lib/utils";
import { getAllUserBranches } from "../branches/get-user-all-branches";

export const getAllProducts = async () => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    const defaultBranch = await getAllUserBranches();
    if (!defaultBranch ||!defaultBranch.branchId) return [];
    const products = await prisma.product.findMany({
      where: {
        BranchProduct: {
          some: {
            branchId: defaultBranch.branchId,
          },
        },
      },
      include: {
        BranchProduct: {
          where: {
            branchId: {
              in: defaultBranch.branches.map(branch => branch.id),
            },
          },
          include: {
            branch: true,
          },
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
