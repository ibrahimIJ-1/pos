"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";
import { getRegisterById } from "../accounting/registers/get-register-by-id";
import { productBranchPOSMapper, ProductPOS } from "@/lib/product-branch-mapper";
import { getCache, setCache } from "../redis/redis-cache";

export const getAllPOSProducts = async () => {
  try {
    await checkUserPermissions([
      ...rolePermissions[UserRole.MANAGER],
      ...rolePermissions[UserRole.CASHIER],
    ]);
    let user = await checkUser();
    const reg = await getRegisterById(user.macAddress);

    if (!reg) {
      throw new Error("Register not found");
    }

    const cacheKey = `pos-products:${reg.branchId}`;
    const cachedProducts = await getCache<ProductPOS[]>(cacheKey);
    if (cachedProducts) {
      const count = await getCache("Count");
      setCache("Count", (Number(count) || 0) + 1);
      
      
      return cachedProducts;
    }

    const products = await prisma.product.findMany({
      where: {
        BranchProduct: {
          some: {
            branchId: reg.branchId,
            isActive: true,
            stock: {
              gt: 0,
            },
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

    const mappedProducts = productBranchPOSMapper(products);
    setCache(cacheKey, mappedProducts);
    // Convert Decimal fields to numbers

    return mappedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};
