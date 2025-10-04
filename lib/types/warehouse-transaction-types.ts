import { Branch, GeneralStatus } from "@prisma/client";
import { useStockIns } from "../stock-in-service";

// Define the StockInRow type explicitly for clarity and stability
export type StockInRow = {
  id: string;
  warehouseId: string;
  date: Date;
  code?: string;
  warehouse:Branch
  status:GeneralStatus
  // Add other fields as needed
};

export type StockInItemFormType = {
  productId: string;
  shelfId: string;
  quantity: number;
};
