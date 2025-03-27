"use server";

import { prisma } from "@/lib/prisma";

export const deleteDiscount = async (id: string) => {
  try {
    await prisma.discount.delete({
      where: { id },
    });

    return "Discount deleted successfully";
  } catch (error) {
    console.error(`Error deleting discount ${id}:`, error);
    throw new Error("Failed to delete discount");
  }
};
