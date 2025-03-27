"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const deleteCartDiscount = async (cartId: string) => {
  try {
    const userId = (await checkUser()).id;
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

    // Remove discount from cart
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        discountId: null,
      },
    });

    return "Discount removed";
  } catch (error) {
    console.error("Error removing discount:", error);
    throw new Error("Failed to remove discount");
  }
};
