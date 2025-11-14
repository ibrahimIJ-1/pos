import { Branch, GeneralStatus } from "@prisma/client";
import { useStockIns } from "../stock-in-service";

// Define the StockInRow type explicitly for clarity and stability
export type WarehouseTransactionRow = {
  id: string;
  warehouseId: string;
  date: Date;
  code?: string;
  warehouse:Branch
  status:GeneralStatus
  transactionType: string;
  // Add other fields as needed
};

export type WarehouseTransactionItemFormType = {
  productId: string;
  shelfId?: string;
  quantity: number;
  warehouseId?: string;
};
