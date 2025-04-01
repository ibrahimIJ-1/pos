"use server"

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getAllCustomers = async () => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.VIEWER],...rolePermissions[UserRole.CASHIER]]);

    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });

    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};
