"use server";

import { prisma } from "@/lib/prisma";

export const getAllPermissions = async () => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: "asc" },
    });

    return permissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw new Error("Failed to fetch permissions");
  }
};
