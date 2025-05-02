"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { SaveSettingsPayload } from "@/lib/types/settings";
import { checkUserPermissions } from "../users/check-permissions";
import { uploadFile } from "../tools/s3-bucket-uploader";

export const saveSetting = async (settings: SaveSettingsPayload) => {
  try {
    // await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    if (!settings || Object.keys(settings).length === 0) {
      throw new Error("No settings provided");
    }
    const results = [];

    // Process each setting in the request
    for (const [key, data] of Object.entries(settings.settings)) {
      let { value, category } = data as { value: string; category: string };
      if (key == "logo") {
        const v: any = value;
        if (typeof v == "object") {
          value = await uploadFile(v, true);
        }
      }
      // Upsert the setting (create if it doesn't exist, update if it does)
      const setting = await prisma.settings.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });

      results.push(setting);
    }

    return results;
  } catch (error) {
    throw new Error("Failed to save settings");
  }
};
