"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const activateBranch = async (id: string) => {
  await checkUserPermissions(rolePermissions[UserRole.OWNER]);

  if (!id || typeof id !== "string") {
    throw new Error("Invalid branch ID");
  }

  try {
    // Check if register exists and is closed
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new Error("Branch not found");
    }

    if (branch.isActive === true) {
      throw new Error("Branch is already activated");
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    return updatedBranch;
  } catch (error) {
    console.error(`Error activating branch ${id}:`, error);
    throw new Error("Failed to activate branch");
  }
};
