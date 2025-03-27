"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const updateCustomerCart = async (
  cartId: string,
  customerId?: string,
  customerName?: string
) => {
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

    // Update the cart with customer info
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        customerId: customerId || null,
      },
    });

    return "Customer updated";
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error("Failed to update customer");
  }
};
