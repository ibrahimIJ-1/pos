"use server";

import { WarehouseTransactionType } from "@prisma/client";
import {
  logWarehouseTransactionItems,
  WarehouseTransactionItemsInterface,
} from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { WarehouseTransactionItemFormType } from "@/lib/types/warehouse-transaction-types";

export const updateStockIn = async ({
  stockInData,
  stockInItems,
}: {
  stockInData: {
    date: Date | null;
    warehouseId: string;
    id: string;
  };
  stockInItems: WarehouseTransactionItemFormType[];
}) => {
  try {
    const updatedStockIn = await prisma.warehouseTransaction.update({
      where: { id: stockInData.id },
      data: {
        ...stockInData,
        transactionType: WarehouseTransactionType.StockIn,
      },
    });

    const warehouseTransactionItems: WarehouseTransactionItemsInterface[] =
      stockInItems.map((item) => ({
        ...item,
        quantity: item.quantity,
        referenceId: updatedStockIn.id,
        warehouseId: stockInData.warehouseId,
      }));

    await logWarehouseTransactionItems(
      warehouseTransactionItems,
      updatedStockIn.id
    );

    return updatedStockIn;
  } catch (error) {
    console.error("Error updating stock in:", error);
    throw new Error("Failed to update stock in");
  }
};
