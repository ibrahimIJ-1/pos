"use server"

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const userRegister = async (
  name: string,
  email: string,
  password: string,
  role?: string
) => {
  try {
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with the specified role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: {
          connect: {
            name: role || "cashier",
          },
        },
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      },
      include: {
        roles: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      avatar: user.avatar,
    };
  } catch (error) {
    throw new Error("An unexpected error occurred");
  }
};
