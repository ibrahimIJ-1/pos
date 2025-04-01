"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { revalidatePath } from "next/cache";

export const checkUserPermissions = async (permissions: string[]) => {
  let user = await checkUser();
  if (!user) throw new Error("No user found");
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });
  if (!dbUser) throw new Error("No user found");
  if (!dbUser.active) throw new Error("User is not active");

  const permissionSet = new Set<string>();

  // Fetching roles and their associated permissions
  const roles = await prisma.role.findMany({
    where: {
      users: { some: { id: user.id } },
    },
    select: {
      permissions: { select: { name: true } },
    },
  });
  roles.forEach((role) =>
    role.permissions.forEach((perm) => permissionSet.add(perm.name))
  );

  // Fetching additional user-specific permissions
  const additionalPermissions = await prisma.userPermission.findMany({
    where: { userId: user.id },
    select: { permission: { select: { name: true } } },
  });
  additionalPermissions.forEach((perm) =>
    permissionSet.add(perm.permission.name)
  );

  // If no permissions are found, trigger path revalidation
  if (permissionSet.size === 0) {
    revalidatePath("/");
  }
  return permissions.some((perm) => permissionSet.has(perm));
};
