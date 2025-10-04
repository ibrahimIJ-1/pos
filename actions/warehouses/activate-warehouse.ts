"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const activateWarehouse = async (id: string) => {
  await checkUserPermissions(rolePermissions[UserRole.OWNER]);

  if (!id || typeof id !== "string") {
    throw new Error("Invalid warehouse ID");
  }

  try {
    // Check if register exists and is closed
    const warehouse = await prisma.branch.findUnique({
      where: { id ,isWarehouse: true },
    });

    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    if (warehouse.isActive === true) {
      throw new Error("Warehouse is already activated");
    }

    const updatedWarehouse = await prisma.branch.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    return updatedWarehouse;
  } catch (error) {
    console.error(`Error activating warehouse ${id}:`, error);
    throw new Error("Failed to activate warehouse");
  }
};
