import { prisma } from "@/lib/prisma";

export const updateUserAvatar = async (id: string, avatar: any) => {
  try {
    if (!avatar) {
      throw new Error("Avatar URL is required");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { avatar },
      select: {
        id: true,
        avatar: true,
      },
    });

    return user;
  } catch (error) {
    console.error(`Error updating user avatar ${id}:`, error);
    throw new Error("Failed to update user avatar");
  }
};
