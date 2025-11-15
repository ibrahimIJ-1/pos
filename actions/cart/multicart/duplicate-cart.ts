"use server";

import { getRegisterById } from "@/actions/accounting/registers/get-register-by-id";
import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const duplicateCart = async (cartId: string) => {
  try {
    const user = await checkUser();
    const userId = user.id;

    const reg = await getRegisterById(user.macAddress);
    if (!reg) throw new Error("Register Not found");
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    const result = await prisma.$transaction(async (tx) => {
      // Check if the cart exists and belongs to the user
      const sourceCart = await prisma.cart.findFirst({
        where: {
          id: cartId,
          userId,
          branchId: reg.branchId,
        },
        include: {
          items: true,
        },
      });

      if (!sourceCart) {
        throw new Error("Cart not found");
      }

      // Set all carts to inactive
      await prisma.cart.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new cart
      const newCart = await prisma.cart.create({
        data: {
          userId,
          name: `${sourceCart.name} (Copy)`,
          isActive: true,
          customerId: sourceCart.customerId,
          discountId: sourceCart.discountId,
          branchId: reg.branchId,
        },
      });

      // Duplicate items
      if (sourceCart.items.length > 0) {
        const items = sourceCart.items.map((item) => ({
          cartId: newCart.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          taxRate: item.taxRate,
        }));

        await prisma.cartItem.createMany({
          data: items,
        });
      }

      // Return the new cart with items
      const duplicatedCart = await prisma.cart.findUnique({
        where: { id: newCart.id, branchId: reg.branchId },
        include: {
          items: true,
        },
      });
      return duplicateCart;
    });

    return {
      ...(decimalToNumber(result) as object),
      active: true,
    };
  } catch (error) {
    console.error("Error duplicating cart:", error);
    throw new Error("Failed to duplicate cart");
  }
};
