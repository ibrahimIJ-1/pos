"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { revalidatePath } from "next/cache";
78;
export const setUserDefaultBranch = async (branchId: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const user = await checkUser();

    if (!branchId) throw new Error("No Branches");
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        branchId: branchId,
      },
    });

    // revalidatePath("/admin/dashboard");
  } catch (error) {
    console.error("Error fetching user branches:", error);
    throw new Error("Failed to fetch user branches");
  }
};
