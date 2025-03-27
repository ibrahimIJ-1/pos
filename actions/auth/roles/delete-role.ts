"use server";

import { prisma } from "@/lib/prisma";

export const deleteRole = async (id: string) => {
  try {
    // Check if any users have this role before deleting
    const usersWithRole = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            id,
          },
        },
      },
      select: { id: true },
    });

    if (usersWithRole.length > 0) {
      throw new Error(
        `Cannot delete role as it is assigned to ${usersWithRole.length} users`
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return "Role deleted successfully";
  } catch (error) {
    console.error(`Error deleting role ${id}:`, error);
    throw new Error("Failed to delete role");
  }
};
