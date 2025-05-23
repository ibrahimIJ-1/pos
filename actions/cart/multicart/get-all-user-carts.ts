"use server";

import { getRegisterById } from "@/actions/accounting/registers/get-register-by-id";
import { checkUser } from "@/actions/Authorization";
import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getAllUserCarts = async () => {
  try {
    const user = await checkUser();
    const userId = user.id;

    const reg = await getRegisterById(user.macAddress);
    if (!reg) throw new Error("Register Not found");
    await checkUserPermissions(rolePermissions[UserRole.CASHIER]);
    // Get all carts for this user
    const carts = await prisma.cart.findMany({
      where: {
        userId,
        branchId:reg.branchId
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // If no carts exist, create a default one
    if (carts.length === 0) {
      const newCart = await prisma.cart.create({
        data: {
          userId,
          name: "Default Cart",
          isActive: true,
          branchId:reg.branchId
        },
        include: {
          items: true,
        },
      });

      return {
        carts: [
          {
            ...(decimalToNumber(newCart) as object),
            active: true,
          },
        ],
        activeCartId: newCart?.id,
      };
    }

    // Format and return the carts
    const formattedCarts = await Promise.all(
      carts.map(async (cart) => {
        let customer = null;
        if (cart.customerId) {
          const customerData = await prisma.customer.findUnique({
            where: { id: cart.customerId },
          });

          if (customerData) {
            customer = {
              id: customerData.id,
              name: customerData.name,
            };
          }
        }

        return {
          id: cart.id,
          name: cart.name,
          items: decimalToNumber(cart.items),
          customer,
          active: cart.isActive,
          createdAt: cart.createdAt,
        };
      })
    );

    const activeCart = formattedCarts.find((cart) => cart.active);
    const allCarts = {
      activeCartId: activeCart?.id,
      carts: formattedCarts,
    };

    return allCarts;
  } catch (error) {
    console.error("Error fetching carts:", error);
    throw new Error("Failed to fetch carts");
  }
};
