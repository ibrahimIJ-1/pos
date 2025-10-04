"use server";

import { prisma } from "@/lib/prisma";
import { checkUserRoles } from "./check-role";
import { UserRole } from "@/lib/permissions";
import { checkUser } from "../Authorization";
import { getAllUserBranches } from "../branches/get-user-all-branches";
import { getAllUserWarehouses } from "../warehouses/get-user-all-warehouses";

export const getAllUsers = async () => {
  try {
    const user = await checkUser();
    const userBranches = await getAllUserBranches();
    const userWarehouses = await getAllUserWarehouses();
    const isOwner = await checkUserRoles([UserRole.OWNER]);
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        active: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: true,
        branchId: true,
        mainBranch: true,
        created_at: true,
        updated_at: true,
      },
      where: {
        ...(isOwner
          ? {}
          : {
              branches: {
                some: {
                  id: {
                    in: [...userBranches.branches.map((branch) => branch.id),
                       ...userWarehouses.map((warehouse) => warehouse.id)],
                  },
                },
              },
            }),
      },
      orderBy: { name: "asc" },
    });

    const usersWithBranchAndWarehouse = users.map((user) => ({
      ...user,
      branches: user.branches.filter((b) => !b.isWarehouse),
      warehouses: user.branches.filter((b) => b.isWarehouse),
    }));

    return usersWithBranchAndWarehouse;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};
