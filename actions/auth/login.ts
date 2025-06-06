"use server";

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function login(
  email: string,
  password: string,
  mac: string
) {
  try {
    if (!email || !password) {
      throw new Error("Fill all the fields");
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    console.log("USER1", "ASDASD");
    const reg = await prisma.register.updateMany({
      where: {
        currentCashierId: user?.id,
      },
      data: {
        currentCashierId: null,
      },
    });

    await prisma.register.updateMany({
      where: {
        id: mac,
      },
      data: {
        currentCashierId: user?.id,
      },
    });
    console.log("USER2", "ASDASD");
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((role) => role.name),
        macAddress: mac,
      },
      process.env.AUTH_SECRET || "your-secret-key-here",
      { expiresIn: "8h" }
    );

    // Return user data and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    throw new Error("Error happened...");
  }
}
