"use server";

import { prisma } from "@/lib/prisma";
import { hardDeleteWarehouseTransactionItems } from "../warehouse-transactions/core";

export const deleteStockIn = async (id: string) => {
  try {
    await hardDeleteWarehouseTransactionItems(id);
    await prisma.warehouseTransaction.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting stock in:", error);
    throw new Error("Failed to delete stock in");
  }
};
