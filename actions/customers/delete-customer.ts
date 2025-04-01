"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const deleteCustomer = async (id: string) => {
  // Check if user has permission to delete customers
  //   if (!req.user?.roles.includes("admin")) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to delete customers" });
  //   }

  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    await prisma.customer.delete({
      where: { id },
    });

    return "Customer deleted successfully";
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw new Error("Failed to delete customer");
  }
};
