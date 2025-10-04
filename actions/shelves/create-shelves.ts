"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { CreateUpdateShelfType } from "@/lib/types/CreateUpdateShelfType";
import { Shelf } from "@prisma/client";

export const createShelves = async ({
  shelves,
  warehouseId,
}: {
  shelves?: CreateUpdateShelfType[];
  warehouseId: string;
}) => {
  console.log("@WAREHOUSE ID:", warehouseId);
  console.log("@WAREHOUSE Shelves:", shelves);

  try {
    if (!warehouseId) {
      throw new Error("Warehouse ID is required");
    }

    if (shelves && shelves.length > 0) {
      const operations = shelves.map((shelf) => {
        if (shelf.id && shelf.id.trim() !== "") {
          return prisma.shelf.update({
            where: { id: shelf.id },
            data: { name: shelf.name, warehouseId },
          });
        } else {
          return prisma.shelf.create({
            data: { name: shelf.name, warehouseId },
          });
        }
      });

      const results = await prisma.$transaction(operations);

      const processedIds = results.map((shelf) => shelf.id);

      // Delete shelves not in the processed list
      await prisma.shelf.deleteMany({
        where: {
          warehouseId,
          id: { notIn: processedIds },
        },
      });
    }
  } catch (error) {
    console.error("Error creating shelves:", error);
    throw new Error("Failed to create shelves");
  }
};
