"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const updateCartItemQuantity = async (
  cartId: string,
  itemId: string,
  quantity: number
) => {
  try {
    const userId = (await checkUser()).id;
    if (quantity === undefined || quantity < 0) {
      throw new Error("Invalid quantity");
    }

    // Get the active cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
        id: cartId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Find the item
    const item = cart.items.find((item) => item.id === itemId);

    if (!item) {
      throw new Error("Item not found in cart");
    }

    if (quantity === 0) {
      // Remove the item if quantity is zero
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update the quantity
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return "Cart updated";
  } catch (error) {
    console.error("Error updating cart:", error);
    throw new Error("Failed to update cart");
  }
};
