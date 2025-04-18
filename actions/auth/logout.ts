"use server";

import { PrismaClient } from "@prisma/client";
import { checkUser } from "../Authorization";

const prisma = new PrismaClient();

export default async function logoutUser() {
  try {
    const user = await checkUser();

    const register = await prisma.register.findUnique({
      where: {
        id: user.macAddress,
        currentCashierId: user.id,
      },
    });
    if (register)
      await prisma.register.update({
        where: {
          id: user.macAddress,
          currentCashierId: user.id,
        },
        data: {
          currentCashierId: null,
        },
      });
    return true;
  } catch (error) {
    throw new Error("Error happened...");
  }
}
