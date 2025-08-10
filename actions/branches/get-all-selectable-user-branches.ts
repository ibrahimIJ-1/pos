"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { checkUserRoles } from "../users/check-role";
78;
export const getAllSelectableUserBranches = async () => {
  try {
    const user = await checkUser();
    const isOwner = await checkUserRoles([UserRole.OWNER]);

    if (!user) throw new Error("No user found");

    const branches = await prisma.branch.findMany({
      orderBy: { created_at: "desc" },
      where: {
        isWarehouse: false,
        isActive: true,
        users: {
          // If the user is an owner, fetch all branches
          ...(isOwner
            ? {}
            : {
                some: {
                  id: user.id,
                },
              }),
        },
      },
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
