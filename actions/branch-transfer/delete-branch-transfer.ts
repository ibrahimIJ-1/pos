"use server";

import { prisma } from "@/lib/prisma";
import { hardDeleteWarehouseTransactionItems } from "../warehouse-transactions/core";

export const deleteBranchTransfer = async (id: string) => {
  try {
    await hardDeleteWarehouseTransactionItems(id);
    await prisma.warehouseTransaction.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting branch transfer:", error);
    throw new Error("Failed to delete branch transfer");
  }
};
