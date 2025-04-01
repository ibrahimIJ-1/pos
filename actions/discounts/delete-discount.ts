"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const deleteDiscount = async (id: string) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.ACCOUNTANT]]);
    await prisma.discount.delete({
      where: { id },
    });

    return "Discount deleted successfully";
  } catch (error) {
    console.error(`Error deleting discount ${id}:`, error);
    throw new Error("Failed to delete discount");
  }
};
