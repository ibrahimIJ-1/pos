"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUserPermissions } from "../users/check-permissions";

export const updateCartDiscount = async (
  cartId: string,
  discountId: string
) => {
  try {
    const userId = (await checkUser()).id;
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    if (!discountId) {
      throw new Error("Discount ID is required");
    }

    // Get the discount from the database
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
    });

    if (!discount) {
      throw new Error("Discount not found");
    }

    if (!discount.isActive) {
      throw new Error("Discount is not active");
    }

    if (discount.endDate && new Date(discount.endDate) < new Date()) {
      throw new Error("Discount has expired");
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      throw new Error("Discount usage limit reached");
    }

    // Get the active cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
        // id: cartId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    if (
      discount.minPurchaseAmount &&
      cart.items.reduce((acc, item) => {
        return acc + Number(item.price) * item.quantity;
      }, 0) < Number(discount.minPurchaseAmount)
    ) {
      throw new Error(
        `The minimum spend should be ${discount.minPurchaseAmount.toString()}`
      );
    }

    // Update the cart with discount info
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        discountId,
      },
    });

    return "Discount applied";
  } catch (error) {
    console.error("Error applying discount:", error);
    throw new Error("Failed to apply discount");
  }
};
