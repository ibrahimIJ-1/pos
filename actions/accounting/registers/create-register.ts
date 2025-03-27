"use server";

import { prisma } from "@/lib/prisma";

export const createRegister = async (name: string, openingBalance = 0) => {
  //   if (!req.user?.roles.some((role) => ["admin", "manager"].includes(role))) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to create registers" });
  //   }

  try {
    if (!name) {
      throw new Error("Register name is required");
    }

    const register = await prisma.register.create({
      data: {
        name,
        status: "CLOSED",
        openingBalance: openingBalance || 0,
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return register;
  } catch (error) {
    console.error("Error creating register:", error);
    throw new Error("Failed to create register");
  }
};
