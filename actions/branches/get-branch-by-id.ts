"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const getBranchById = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) throw new Error("No transaction found...");

    return branch;
  } catch (error) {
    console.error("Error fetching branch:", error);
    throw new Error("Failed to fetch branch");
  }
};
