"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createCategory = async (data: {
  name: string;
  imageUrl?: string;
  color?: string;
}) => {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        color: data.color,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
};
