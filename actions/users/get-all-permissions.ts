"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { checkUserPermissions } from "./check-permissions";

export const getAllUserPermissions = async ({
  alterUser,
}: {
  alterUser?: any | undefined;
}) => {
  console.log("Permissions:", "Start fetching permissions for user", alterUser);
  let user = alterUser ?? (await checkUser());
  console.log("@USER", user);

  if (!user) throw new Error("No user found");
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });
  console.log("@DBUSER", dbUser);
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
  console.log("@roles", roles);

  // Fetching additional user-specific permissions
  const additionalPermissions = await prisma.userPermission.findMany({
    where: { userId: user.id },
    select: { permission: { select: { name: true } } },
  });
  additionalPermissions.forEach((perm) =>
    permissionSet.add(perm.permission.name)
  );
  console.log("@additionalPermissions", additionalPermissions);
  // If no permissions are found, trigger path revalidation
  console.log("Permissions:", permissionSet);

  return permissionSet;
};
