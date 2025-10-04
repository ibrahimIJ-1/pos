"use server";

import {
  GeneralStatus,
  StockIn,
  WarehouseTransactionType,
} from "@prisma/client";
import {
  logWarehouseTransactionItems,
  WarehouseTransactionItemsInterface,
} from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { StockInItemFormType } from "@/lib/types/warehouse-transaction-types";
import { date } from "zod";

export const createStockIn = async ({
  stockInData,
  stockInItems,
}: {
  stockInData: {
    date: Date | null;
    warehouseId: string;
  };
  stockInItems: StockInItemFormType[];
}) => {
  try {
    const createdStockIn = await prisma.stockIn.create({
      data: {
        date: stockInData.date || new Date(),
        warehouseId: stockInData.warehouseId,
        status: GeneralStatus.COMPLETED,
        code: `SI-${Date.now()}`,
      },
    });

    const warehouseTransactionItems = stockInItems.map((item) => ({
      ...item,
      warehouseId: stockInData.warehouseId,
      transactionType: WarehouseTransactionType.StockIn,
      referenceId: createdStockIn.id,
    }));

    await logWarehouseTransactionItems(warehouseTransactionItems);

    return createdStockIn;
  } catch (error) {
    console.error("Error creating stock in:", error);
    throw new Error("Failed to create stock in");
  }
};
