"use server";

import {
  GeneralStatus,
  WarehouseTransactionType,
} from "@prisma/client";
import {
  logWarehouseTransactionItems,
} from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { WarehouseTransactionItemFormType } from "@/lib/types/warehouse-transaction-types";

export const createStockIn = async ({
  stockInData,
  stockInItems,
}: {
  stockInData: {
    date: Date | null;
    warehouseId: string;
  };
  stockInItems: WarehouseTransactionItemFormType[];
}) => {
  try {
    const createdStockIn = await prisma.warehouseTransaction.create({
      data: {
        date: stockInData.date || new Date(),
        warehouseId: stockInData.warehouseId,
        status: GeneralStatus.COMPLETED,
        code: `SI-${Date.now()}`,
        transactionType: WarehouseTransactionType.StockIn,
      },
    });

    const warehouseTransactionItems = stockInItems.map((item) => ({
      ...item,
      quantity: item.quantity,
      warehouseId: stockInData.warehouseId,
      referenceId: createdStockIn.id,
    }));

    await logWarehouseTransactionItems(warehouseTransactionItems);

    return createdStockIn;
  } catch (error) {
    console.error("Error creating stock in:", error);
    throw new Error("Failed to create stock in");
  }
};
