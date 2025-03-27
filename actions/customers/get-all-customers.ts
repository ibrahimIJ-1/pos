"use server"

import { prisma } from "@/lib/prisma";

export const getAllCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });

    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};
