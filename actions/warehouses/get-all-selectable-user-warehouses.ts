"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { checkUserRoles } from "../users/check-role";
78;
export const getAllSelectableUserWarehouses = async () => {
  try {
    const user = await checkUser();
    const isOwner = await checkUserRoles([UserRole.OWNER]);

    if (!user) throw new Error("No user found");

    const warehouses = await prisma.branch.findMany({
      orderBy: { created_at: "desc" },
      where: {
        isWarehouse: true,
        isActive: true,
        users: {
          // If the user is an owner, fetch all warehouses
          ...(isOwner
            ? {}
            : {
                some: {
                  id: user.id,
                },
              }),
        },
      },
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
