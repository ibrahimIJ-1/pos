"use server"

import { prisma } from "@/lib/prisma";

export const getSetting = async (category?: string) => {
  try {
    const whereClause = category ? { category: category as string } : {};

    const settings = await prisma.settings.findMany({
      where: whereClause,
    });

    // Format settings as a key-value object for easier consumption
    const formattedSettings = settings.reduce((acc, setting) => {
      return {
        ...acc,
        [setting.key]: setting.value,
      };
    }, {});

    return formattedSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new Error("Failed to fetch settings");
  }
};
