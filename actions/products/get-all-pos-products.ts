"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";
import { getRegisterById } from "../accounting/registers/get-register-by-id";
import { productBranchPOSMapper } from "@/lib/product-branch-mapper";

export const getAllPOSProducts = async () => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    let user = await checkUser();
    const reg = await getRegisterById(user.macAddress);
    const products = await prisma.product.findMany({
      where: {
        BranchProduct: {
          some: {
            branchId: reg.branchId,
            isActive: true,
          },
        },
      },
      include: {
        BranchProduct: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Convert Decimal fields to numbers

    return productBranchPOSMapper(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};
