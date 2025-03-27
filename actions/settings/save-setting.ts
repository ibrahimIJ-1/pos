"use server";

import { prisma } from "@/lib/prisma";
import { SaveSettingsPayload } from "@/lib/types/settings";

export const saveSetting = async (settings: SaveSettingsPayload) => {
  try {
    if (!settings || Object.keys(settings).length === 0) {
      throw new Error("No settings provided");
    }
    const results = [];

    // Process each setting in the request
    for (const [key, data] of Object.entries(settings.settings)) {
      const { value, category } = data as { value: string; category: string };

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
