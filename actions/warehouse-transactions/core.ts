"use server";

import { prisma } from "@/lib/prisma";
import { WarehouseTransactionType } from "@prisma/client";

export interface WarehouseTransactionItemsInterface {
  id?: string;
  warehouseId: string;
  shelfId?: string;
  productId: string;
  quantity: number;
  transactionType: WarehouseTransactionType;
  referenceId?: string;
}

export const logWarehouseTransactionItems = async (
  data: WarehouseTransactionItemsInterface[],
  referenceId?: string,
) => {
  try {
    await hardDeleteWarehouseTransactionItems(referenceId || "");
    await prisma.warehouseTransactions.createMany({
      data,
    });
    return true;
  } catch (error) {
    console.error("Error logging warehouse transaction:", error);
    throw new Error("Failed to log warehouse transaction");
  }
};

export const softDeleteWarehouseTransactionItems = async (
  referenceId: string
) => {
  try {
    await prisma.warehouseTransactions.updateMany({
      where: {
        referenceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};

export const hardDeleteWarehouseTransactionItems = async (
  referenceId: string
) => {
  try {
    await prisma.warehouseTransactions.deleteMany({
      where: {
        referenceId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};

export const getWarehouseTransactionItems = async (referenceId: string) => {
  try {
    await prisma.warehouseTransactions.deleteMany({
      where: {
        referenceId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};
