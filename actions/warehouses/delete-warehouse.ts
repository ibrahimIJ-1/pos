"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const deleteWarehouse = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);

    await prisma.branch.delete({
      where: { id, isWarehouse: true },
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw new Error("Failed to delete warehouse");
  }
};
