"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { checkUserPermissions } from "../users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { decimalToNumber } from "@/lib/utils";
import { getMyActiveUserCart } from "./get-my-active-cart";

export const addCartItem = async ({
  cartId,
  productId,
  name,
  price,
  quantity,
  taxRate = 0,
}: {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate?: number;
}) => {
  try {
    const userId = (await checkUser()).id;
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);

    // Use a single upsert instead of checking if cart exists separately
    const updatedCart = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, name, price, quantity, taxRate },
    });
    const myCart = getMyActiveUserCart(userId);
    return myCart;
    
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
};
