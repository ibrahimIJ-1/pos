"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { getAllUserBranches } from "../branches/get-user-all-branches";
import { getAllUserWarehouses } from "../warehouses/get-user-all-warehouses";
import { checkUserRoles } from "../users/check-role";
import { UserRole } from "@/lib/permissions";
import { decimalToNumber } from "@/lib/utils";
import { WarehouseTransactionType } from "@prisma/client";

export const getbranchTransfer = async (id: string) => {
  try {
    const user = await checkUser();
    const userWarehouses = await getAllUserWarehouses();
    const branchTransfer = await prisma.warehouseTransaction.findUnique({
      where: {
        id,
        warehouseId: {
          in: [...userWarehouses.map((warehouse) => warehouse.id)],
        },
        transactionType: WarehouseTransactionType.BranchTransfer,
      },
      include: {
        warehouseTransactionItems: true,
      },
    });
    const convertedBranchTransfers = decimalToNumber(branchTransfer);
    return convertedBranchTransfers;
  } catch (error) {
    console.error("Error fetching stock in:", error);
    throw new Error("Failed to fetch stock in");
  }
};
