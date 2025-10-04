"use server";

import { StockIn, WarehouseTransactionType } from "@prisma/client";
import {
  logWarehouseTransactionItems,
  WarehouseTransactionItemsInterface,
} from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { StockInItemFormType } from "@/lib/types/warehouse-transaction-types";

export const updateStockIn = async ({
  stockInData,
  stockInItems,
}: {
  stockInData: {
    date: Date | null;
    warehouseId: string;
    id: string;
  };
  stockInItems: StockInItemFormType[];
}) => {
  try {
    const updatedStockIn = await prisma.stockIn.update({
      where: { id: stockInData.id },
      data: stockInData,
    });

    const warehouseTransactionItems: WarehouseTransactionItemsInterface[] =
      stockInItems.map((item) => ({
        ...item,
        referenceId: updatedStockIn.id,
        warehouseId: stockInData.warehouseId,
        transactionType: WarehouseTransactionType.StockIn,
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
