"use server";

import { GeneralStatus, WarehouseTransactionType } from "@prisma/client";
import { logWarehouseTransactionItems } from "../warehouse-transactions/core";
import { prisma } from "@/lib/prisma";
import { WarehouseTransactionItemFormType } from "@/lib/types/warehouse-transaction-types";
import { buildItems } from "../warehouse-transactions/helper";

export const createBranchTransfer = async ({
  branchTransferData,
  branchTransferItems,
}: {
  branchTransferData: {
    date: Date | null;
    warehouseId: string;
  };
  branchTransferItems: WarehouseTransactionItemFormType[];
}) => {
  try {
    const createdBranchTransfer = await prisma.warehouseTransaction.create({
      data: {
        date: branchTransferData.date || new Date(),
        warehouseId: branchTransferData.warehouseId,
        status: GeneralStatus.COMPLETED,
        code: `SI-${Date.now()}`,
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
      createdBranchTransfer.id
    );

    const branchTransactionItems = buildItems(
      branchTransferItems,
      {
        sign: 1,
        clearShelf: true,
      },
      createdBranchTransfer.id
    );

    await logWarehouseTransactionItems([
      ...warehouseTransactionItems,
      ...branchTransactionItems,
    ]);

    return createdBranchTransfer;
  } catch (error) {
    console.error("Error creating stock in:", error);
    throw new Error("Failed to create stock in");
  }
};
