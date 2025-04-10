"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const deleteBranch = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);

    await prisma.branch.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw new Error("Failed to delete branch");
  }
};
