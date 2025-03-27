"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { RegisterTransaction } from "@prisma/client";

export const createRegisterTransaction = async (
  registerTransaction: RegisterTransaction
) => {
  try {    
   const transaction =  await prisma.registerTransaction.create({
      data: registerTransaction,
    });

    return decimalToNumber(transaction);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};
