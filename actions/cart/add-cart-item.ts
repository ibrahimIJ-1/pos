"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const addCartItem = async ({
  cartId,
  productId,
  name,
  price,
  quantity,
  taxRate,
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

    if (!productId || !name || price === undefined || !quantity) {
      throw new Error("Missing required product details");
    }

    // Get the active cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
        id: cartId,
      },
      include: {
        items: true,
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          name: "Default Cart",
          isActive: true,
        },
        include: {
          items: true,
        },
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // Update quantity if already in cart
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          name,
          price,
          quantity,
          taxRate: taxRate || 0,
        },
      });
    }

    return "Item added to cart";
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
};
