"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const checkUserRoles = async (roles: string[]) => {
  let user = await checkUser();
  if (!user) throw new Error("No user found");
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });
  if (!dbUser) throw new Error("No user found");
  if (!dbUser.active) throw new Error("User is not active");

  // Fetching roles and their associated permissions
  const userRoles = await prisma.role.findMany({
    where: {
      users: { some: { id: user.id } },
      name: { in: roles },
    },
  });
  if (!userRoles || userRoles.length === 0) return false;
  return true;
};
