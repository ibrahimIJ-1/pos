"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const deleteRegister = async (id: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);

    await prisma.register.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting register:", error);
    throw new Error("Failed to fetch registers");
  }
};
