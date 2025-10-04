"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

78;
export const getUserCurrentWarehouse = async () => {
  try {
    const user = await checkUser();
    const currentWarehouse = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        branchId: true,
      },
    });
    return currentWarehouse?.branchId;
  } catch (error) {
    console.error("Error fetching default user warehouse:", error);
    throw new Error("Failed to fetch warehousees");
  }
};
