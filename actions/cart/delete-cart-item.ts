"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUserPermissions } from "../users/check-permissions";
import { getMyActiveUserCart } from "./get-my-active-cart";

export const deleteCartItem = async (cartId: string, itemId: string) => {
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

    // Delete the item
    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (deleteResult.count === 0) {
      throw new Error("Item not found in cart");
    }

    const myCart = await getMyActiveUserCart(userId);
    return myCart;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error("Failed to remove item from cart");
  }
};
