"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { checkUserPermissions } from "./check-permissions";

export const createNewUser = async (
  name: string,
  email: string,
  password: string,
  roles: string[],
  active?: boolean,
  branches?: string[]
) => {
  try {
    // Validate required fields
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    if (
      !name ||
      !email ||
      !password ||
      !roles ||
      !Array.isArray(roles) ||
      roles.length === 0
    ) {
      throw new Error("Missing required user fields");
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        active: active ?? true,
        roles: {
          connect: roles.map((role: string) => ({ name: role })),
        },
        branches: {
          connect: [
            ...(branches
              ? branches.map((branch: string) => ({ id: branch }))
              : []),
          ],
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
        branches: true,
        branchId: true,
        mainBranch: true,
        created_at: true,
        updated_at: true,
      },
    });

    const userWithBranchAndWarehouse = {
      ...user,
      branches: user.branches.filter((b) => !b.isWarehouse)
    };

    return userWithBranchAndWarehouse;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};
