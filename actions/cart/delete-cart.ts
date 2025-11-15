"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUserPermissions } from "../users/check-permissions";

export const deleteCart = async (cartId: string) => {
  try {
    const userId = (await checkUser()).id;
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    // Get the active cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
        id: cartId,
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }
    const result = await prisma.$transaction(async (tx) => {
      // Delete all items in the cart
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      // Update cart to remove customer and discount
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          customerId: null,
          discountId: null,
        },
      });
    });
    return "Cart cleared";
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
};
