"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateCategory = async (data: {
  id: string;
  name: string;
  imageUrl?: string;
  color?: string;
}) => {
  try {
    const category = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        color: data.color,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
};
