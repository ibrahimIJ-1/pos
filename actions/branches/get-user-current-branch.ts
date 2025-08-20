"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

78;
export const getUserCurrentBranch = async () => {
  try {
    const user = await checkUser();
    const currentBranch = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        branchId: true,
      },
    });
    return currentBranch?.branchId;
  } catch (error) {
    console.error("Error fetching default user branch:", error);
    throw new Error("Failed to fetch branches");
  }
};
