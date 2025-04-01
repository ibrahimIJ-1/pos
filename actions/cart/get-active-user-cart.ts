"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUserPermissions } from "../users/check-permissions";
import { getMyActiveUserCart } from "./get-my-active-cart";

export const getActiveUserCart = async () => {
  try {
    const userId = (await checkUser()).id;
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    // Get the active cart for this user
    return await getMyActiveUserCart(userId);
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
};
