"use server";

import { prisma } from "@/lib/prisma";

export const getAllRegisters = async () => {
  try {
    const registers = await prisma.register.findMany({
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return registers;
  } catch (error) {
    console.error("Error fetching registers:", error);
    throw new Error("Failed to fetch registers");
  }
};
