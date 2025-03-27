"use server";

import { prisma } from "@/lib/prisma";

export const getSettingByName = async (key: string) => {
  try {
    const setting = await prisma.settings.findFirst({
      where: {
        key,
      },
    });

    if (!setting)
      return {
        id: "1",
        created_at: new Date(),
        updated_at: new Date(),
        key: "",
        value: "0",
        category: "string",
      };
    return setting;
  } catch (error) {
    console.error("Error fetching setting:", error);
    return new Error("Failed to fetch setting");
  }
};
