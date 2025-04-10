"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
78
export const getAllBranches = async () => {
  try {
    await checkUserPermissions(rolePermissions[UserRole.OWNER]);

    const branches = await prisma.branch.findMany({
      orderBy: { created_at: "desc" },
    });

    // Ensure created_at is a valid Date object and format it
    const formattedBranches = branches.map((branch) => ({
      ...branch,
      created_at: branch.created_at
        ? new Date(branch.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19) // Format: YYYY-MM-DD HH:mm:ss
        : null, // Handle null cases
    }));

    return formattedBranches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw new Error("Failed to fetch branches");
  }
};
