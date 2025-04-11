"use server";

import { prisma } from "@/lib/prisma";

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        active: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        branches:true,
        branchId:true,
        mainBranch:true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};
