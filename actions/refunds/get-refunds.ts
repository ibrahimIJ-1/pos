"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUser } from "../Authorization";
import { checkUserPermissions } from "../users/check-permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getRefunds = async () => {
  try {
    const user = await checkUser();
    if (!user) throw new Error("user not found");
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);

    const branch = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        branchId: true,
      },
    });

    if (!branch || !branch.branchId)
      throw new Error("check the user branch...");

    const refunds = await prisma.refund.findMany({
      where: {
        branchId: branch?.branchId,
      },
      orderBy: [
        {
          // Pending first → assuming status is a string enum
          status: "asc", // alphabetical, so 'PENDING' < 'APPROVED'
        },
        {
          updated_at: "desc", // most recent updated first
        },
      ],
      include: {
        items: {
          include: {
            saleItem: true,
          },
        },
        sale: {
          select: {
            saleNumber: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return decimalToNumber(refunds);
  } catch (error) {
    throw new Error("Error in fetching the refunds");
  }
};
