"use server";

import { WarehouseTransactionType } from "@prisma/client";
import {
  logWarehouseTransactionItems,
  WarehouseTransactionItemsInterface,
} from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { WarehouseTransactionItemFormType } from "@/lib/types/warehouse-transaction-types";
import { buildItems } from "../warehouse-transactions/helper";

export const updateBranchTransfer = async ({
  branchTransferData,
  branchTransferItems,
}: {
  branchTransferData: {
    date: Date | null;
    warehouseId: string;
    id: string;
  };
  branchTransferItems: WarehouseTransactionItemFormType[];
}) => {
  try {
    const updatedBranchTransfer = await prisma.warehouseTransaction.update({
      where: { id: branchTransferData.id },
      data: {
        ...branchTransferData,
        transactionType: WarehouseTransactionType.BranchTransfer,
      },
    });

    const warehouseTransactionItems = buildItems(
      branchTransferItems,
      {
        sign: -1,
        warehouseId: branchTransferData.warehouseId,
        clearShelf: false,
      },
      updatedBranchTransfer.id
    );

    const branchTransactionItems = buildItems(
      branchTransferItems,
      {
        sign: 1,
        clearShelf: true,
      },
      updatedBranchTransfer.id
    );

    await logWarehouseTransactionItems([
      ...warehouseTransactionItems,
      ...branchTransactionItems,
    ]);

    return updatedBranchTransfer;
  } catch (error) {
    console.error("Error updating stock in:", error);
    throw new Error("Failed to update stock in");
  }
};
