"use server";

import { getRegisterById } from "@/actions/accounting/registers/get-register-by-id";
import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const deleteCurrentCart = async (cartId: string) => {
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
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const wasActive = cart.isActive;

    // Delete the cart and all its items (cascade delete)
    await prisma.cart.delete({
      where: { id: cartId },
    });

    // If the deleted cart was active, make another cart active
    if (wasActive) {
      const anotherCart = await prisma.cart.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (anotherCart) {
        await prisma.cart.update({
          where: { id: anotherCart.id },
          data: {
            isActive: true,
          },
        });
      } else {
        // Create a new default cart if none exists
        await prisma.cart.create({
          data: {
            userId,
            name: "Default Cart",
            isActive: true,
            branchId:reg.branchId
          },
        });
      }
    }

    return "Cart removed";
  } catch (error) {
    console.error("Error removing cart:", error);
    throw new Error("Failed to remove cart");
  }
};
