"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { getAllUserBranches } from "../branches/get-user-all-branches";
import { getAllUserWarehouses } from "../warehouses/get-user-all-warehouses";
import { checkUserRoles } from "../users/check-role";
import { UserRole } from "@/lib/permissions";
import { decimalToNumber } from "@/lib/utils";

export const getAllStockIns = async () => {
  try {
    const user = await checkUser();
    const userWarehouses = await getAllUserWarehouses();
    const stockIns = await prisma.warehouseTransaction.findMany({
      where: {
        warehouseId: {
          in: [...userWarehouses.map((warehouse) => warehouse.id)],
        },
      },
      include: {
        warehouseTransactionItems: true,
        warehouse: true,
      },
    });
    const convertedStockIns = decimalToNumber(stockIns);
    return convertedStockIns;
  } catch (error) {
    console.error("Error fetching stock in:", error);
    throw new Error("Failed to fetch stock in");
  }
};
