"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Shelf } from "@prisma/client";
import { createShelves } from "../shelves/create-shelves";
import { CreateUpdateShelfType } from "@/lib/types/CreateUpdateShelfType";

export const createWarehouse = async (
  name: string,
  address: string,
  shelves?: CreateUpdateShelfType[]
) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);

    if (!name) {
      throw new Error("Warehouse name is required");
    }

    const warehouse = await prisma.branch.create({
      data: {
        name,
        address,
        isWarehouse: true,
      },
    });
    if (shelves && shelves.length > 0) {
      createShelves({ shelves, warehouseId: warehouse.id });
    }

    const updatedShelves = await prisma.shelf.findMany({
      where: { warehouseId: warehouse.id },
    });

    return { ...warehouse, shelves: updatedShelves || [] };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    throw new Error("Failed to create warehouse");
  }
};
