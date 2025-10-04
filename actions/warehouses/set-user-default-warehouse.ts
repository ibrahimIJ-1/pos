"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { revalidatePath } from "next/cache";
78;
export const setUserDefaultWarehouse = async (warehouseId: string) => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);
    const user = await checkUser();

    if (!warehouseId) throw new Error("No Warehousees");
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        branchId: warehouseId,
      },
    });

    // revalidatePath("/admin/dashboard");
  } catch (error) {
    console.error("Error fetching user warehousees:", error);
    throw new Error("Failed to fetch user warehousees");
  }
};
