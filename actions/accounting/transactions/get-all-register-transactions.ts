"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export const getAllRegisterTransactions = async () => {
  try {
    const registers = await prisma.registerTransaction.findMany({
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Ensure created_at is a valid Date object and format it
    const formattedRegisters = registers.map((register) => ({
      ...register,
      created_at: register.created_at
        ? new Date(register.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19) // Format: YYYY-MM-DD HH:mm:ss
        : null, // Handle null cases
    }));

    return decimalToNumber(formattedRegisters);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};
