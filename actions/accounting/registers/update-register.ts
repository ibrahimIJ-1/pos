"use server";

import { checkUserPermissions } from "@/actions/users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const updateRegister = async (macAddress:string,name: string, openingBalance = 0) => {
  //   if (!req.user?.roles.some((role) => ["admin", "manager"].includes(role))) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to create registers" });
  //   }

  try {
      await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    
    if (!name) {
      throw new Error("Register name is required");
    }

    const register = await prisma.register.update({
      where:{
        id:macAddress
      },
      data: {
        id:macAddress,
        name,
        openingBalance: openingBalance || 0,
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return decimalToNumber(register);
  } catch (error) {
    console.error("Error creating register:", error);
    throw new Error("Failed to create register");
  }
};
