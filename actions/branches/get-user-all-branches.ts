"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
78;
export const getAllUserBranches = async () => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const user = await checkUser();
    const mainBranchId = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        branchId: true,
      },
    });
    const branches = await prisma.branch.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
    if (branches.length <= 0) throw new Error("No Branches");
    if (!mainBranchId?.branchId) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          branchId: branches[0].id,
        },
      });
    }
    return {
      branches: branches,
      branchId: mainBranchId ? mainBranchId.branchId : branches[0].id,
    };
  } catch (error) {
    console.error("Error fetching user branches:", error);
    throw new Error("Failed to fetch user branches");
  }
};
