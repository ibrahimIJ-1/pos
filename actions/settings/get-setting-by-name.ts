"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getSettingByName = async (key: string) => {
  try {
    const setting = await prisma.settings.findFirst({
      where: {
        key,
      },
    });

    if (!setting) return null;
    return setting;
  } catch (error) {
    console.error("Error fetching setting:", error);
    return null;
  }
};
