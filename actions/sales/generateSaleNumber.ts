"use server";

import { prisma } from "@/lib/prisma";

export const generateSaleNumber = async () => {
  // Get current date in YYYYMMDD format
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");

  // Count sales made today to generate sequential number
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const salesCount = await prisma.sale.count({
    where: {
      created_at: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Format: YYYYMMDD-XXXX (where XXXX is the sequential number)
  return `${dateStr}-${(salesCount + 1).toString().padStart(4, "0")}`;
};
