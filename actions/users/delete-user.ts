"use server";

import { prisma } from "@/lib/prisma";

export const deleteUserById = async (id: string) => {
  try {
    // Check if trying to delete own account
    // if (id === req.user!.id) {
    //   return res.status(400).json({ error: "Cannot delete your own account" });
    // }

    await prisma.user.delete({
      where: { id },
    });

    return "User deleted successfully";
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw new Error("Failed to delete user");
  }
};
