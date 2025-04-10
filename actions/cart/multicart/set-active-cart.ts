"use server";

import { getRegisterById } from "@/actions/accounting/registers/get-register-by-id";
import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const setActiveCart = async (cartId: string) => {
  try {
    const user = await checkUser();
    const userId = user.id;

    const reg = await getRegisterById(user.macAddress);
    if (!reg) throw new Error("Register Not found");
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    // Check if the cart exists and belongs to the user
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        userId,
        branchId: reg.branchId,
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

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

    // Set the specified cart to active
    await prisma.cart.update({
      where: { id: cartId, branchId: reg.branchId },
      data: {
        isActive: true,
      },
    });

    return "Active cart updated";
  } catch (error) {
    console.error("Error switching cart:", error);
    throw new Error("Failed to switch cart");
  }
};
