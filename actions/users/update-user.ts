"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { checkUserPermissions } from "./check-permissions";
export const updateUser = async ({
  id,
  name,
  email,
  roles,
  active,
  branches,
  warehouses,
}: {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles?: string[];
  active?: boolean;
  branches?: string[];
  warehouses?: string[];
}) => {
  try {
    // Validate required fields
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    // Prepare update data
    const updated_ata: any = {
      name,
      email,
      active: active !== undefined ? active : true,
    };

    // If password is provided, hash it
    // updated_ata.password = await bcrypt.hash("12345678", 10);

    // Update the user
    const userBranchesAndWarehouses = [
      ...(branches?.map((branch: string) => ({ id: branch })) || []),
      ...(warehouses?.map((warehouse: string) => ({ id: warehouse })) || []),
    ];
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updated_ata,
        roles: roles
          ? {
              set: [], // First disconnect all roles
              connect: roles.map((role: string) => ({ name: role })),
            }
          : undefined,
        branches: {
          set: [], // First disconnect all roles
          connect: userBranchesAndWarehouses,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        active: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        branchId: true,
        mainBranch: true,
        created_at: true,
        updated_at: true,
        branches: true,
      },
    });

    const userWithBranchAndWarehouse = {
      ...user,
      branches: user.branches.filter((b) => !b.isWarehouse),
      warehouses: user.branches.filter((b) => b.isWarehouse),
    };

    return userWithBranchAndWarehouse;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw new Error("Failed to update user");
  }
};

export const updateUserPassword = async ({
  id,
  password,
}: {
  id: string;

  password?: string;
}) => {
  try {
    // Validate required fields
    if (!password) {
      throw new Error("Password required");
    }

    // Prepare update data
    const updated_ata: any = {
      password,
    };

    // If password is provided, hash it
    if (password) {
      updated_ata.password = await bcrypt.hash(password, 10);
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updated_ata,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        active: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: true,
        created_at: true,
        updated_at: true,
      },
    });

    const userWithBranchAndWarehouse = {
      ...user,
      branches: user.branches.filter((b) => !b.isWarehouse),
      warehouses: user.branches.filter((b) => b.isWarehouse),
    };

    return userWithBranchAndWarehouse;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw new Error("Failed to update user");
  }
};
