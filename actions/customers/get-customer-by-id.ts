"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getCustomerById = async (id: string) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.VIEWER],...rolePermissions[UserRole.CASHIER]]);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { created_at: "desc" },
          take: 10, // Get the most recent 10 sales
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw new Error("Failed to fetch customer");
  }
};
