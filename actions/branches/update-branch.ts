"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const updateBranch = async (
  id: string,
  name: string,
  address: string
) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);

    if (!name) {
      throw new Error("Branch name is required");
    }

    const branch = await prisma.branch.update({
      where: {
        id,
      },
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
