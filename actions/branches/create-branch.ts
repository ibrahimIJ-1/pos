"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const createBranch = async (name: string, address: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);

    if (!name) {
      throw new Error("Branch name is required");
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
      },
    });

    return branch;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw new Error("Failed to create branch");
  }
};
