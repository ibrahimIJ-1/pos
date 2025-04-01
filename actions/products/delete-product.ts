"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const deleteProduct = async (id: string) => {
  // Check if user has permission to delete products
  //   if (
  //     !req.user?.roles.includes("admin") &&
  //     !req.user?.roles.includes("manager")
  //   ) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to delete products" });
  //   }

  try {
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    await prisma.product.delete({
      where: { id },
    });

    return "Product deleted successfully";
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw new Error("Failed to delete product");
  }
};
