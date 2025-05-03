"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getSettingByName = async (key: string, bypassError?: boolean) => {
  try {
    const setting = await prisma.settings.findFirst({
      where: {
        key,
      },
    });

    if (!setting) {
      if (bypassError === true) {
        return {
          id: "",
          created_at: new Date(),
          updated_at: new Date(),
          key: key,
          value: "",
          category: "",
        };
      } else {
        throw new Error(`${key} setting: not found`);
      }
    }
    return setting;
  } catch (error) {
    console.error(`Error fetching ${key} setting `, error);
    throw new Error(`Error fetching ${key} setting`);
  }
};
