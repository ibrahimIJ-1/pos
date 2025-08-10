"use server";

import { prisma } from "@/lib/prisma";
import { checkUserRoles } from "./check-role";
import { UserRole } from "@/lib/permissions";
import { checkUser } from "../Authorization";
import { getAllUserBranches } from "../branches/get-user-all-branches";

export const getAllUsers = async () => {
  try {
    const user = await checkUser();
    const userBranches = await getAllUserBranches();
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
                    in: userBranches.branches.map((branch) => branch.id),
                  },
                },
              },
            }),
      },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};
