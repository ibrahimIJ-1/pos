"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getAllUserWarehouses } from "./get-user-all-warehouses";
import { checkUserRoles } from "../users/check-role";
78;
export const getAllWarehouses = async () => {
  const permission = await checkUserRoles([UserRole.ADMIN]);
  if (!permission) return [];
  try {
    const allWarehouses = await getAllUserWarehouses();
    const warehouses = await prisma.branch.findMany({
      where: {
        id: {
          in: allWarehouses.map((warehouse) => warehouse.id),
        },
      },
      include: {
        Shelf: true,
      },
      orderBy: { created_at: "desc" },
    });

    // Ensure created_at is a valid Date object and format it
    const formattedWarehouses = warehouses.map((warehouse) => ({
      ...warehouse,
      created_at: warehouse.created_at
        ? new Date(warehouse.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19) // Format: YYYY-MM-DD HH:mm:ss
        : null, // Handle null cases
    }));

    return formattedWarehouses;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw new Error("Failed to fetch warehouses");
  }
};
