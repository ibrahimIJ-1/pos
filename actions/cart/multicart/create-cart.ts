"use server";

import { getRegisterById } from "@/actions/accounting/registers/get-register-by-id";
import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const createCart = async () => {
  try {
    const user = await checkUser();
    const userId = user.id;
    const reg = await getRegisterById(user.macAddress);
    if (!reg) throw new Error("Register Not found");
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);

    // First, set all carts to inactive
    await prisma.cart.updateMany({
      where: {
        userId,
        isActive: true,
        branchId: reg.branchId,
      },
      data: {
        isActive: false,
      },
    });

    // Create a new cart and set it active
    const newCart = await prisma.cart.create({
      data: {
        userId,
        name: `Cart ${new Date().toLocaleTimeString()}`,
        isActive: true,
        branchId: reg.branchId,
      },
      include: {
        items: true,
      },
    });

    return {
      ...newCart,
      active: true,
    };
  } catch (error) {
    console.error("Error creating cart:", error);
    throw new Error("Failed to create cart");
  }
};
