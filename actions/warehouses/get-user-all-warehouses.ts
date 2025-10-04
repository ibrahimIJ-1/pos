"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { checkUserRoles } from "../users/check-role";
//TODO: make warehouse permissions seperated from the user branches
export const getAllUserWarehouses = async () => {
  try {
    // await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const user = await checkUser();
    const isOwner = await checkUserRoles([UserRole.OWNER]);

    const warehouses = await prisma.branch.findMany({
      where: {
        isWarehouse: true,
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
      select: {
        id: true,
        name: true,
        Shelf: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    if (warehouses.length <= 0) return [];

    return warehouses;
  } catch (error) {
    console.error("Error fetching user warehouses:", error);
    throw new Error("Failed to fetch user warehouses");
  }
};
