"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const getWarehouseById = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const warehouse = await prisma.branch.findUnique({
      where: { id, isWarehouse: true },
    });

    if (!warehouse) throw new Error("No warehouse found...");

    return warehouse;
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    throw new Error("Failed to fetch warehouse");
  }
};
