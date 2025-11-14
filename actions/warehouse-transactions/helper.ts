import { WarehouseTransactionItemFormType } from "@/lib/types/warehouse-transaction-types";

export const buildItems = (
  items: WarehouseTransactionItemFormType[],
  opts: { sign?: 1 | -1; warehouseId?: string; clearShelf?: boolean },
  referenceId: string
) =>
  items.map((item) => ({
    ...item,
    quantity: (opts.sign ?? 1) * item.quantity,
    warehouseId: opts.warehouseId ?? item.warehouseId!,
    shelfId: opts.clearShelf ? undefined : item.shelfId,
    referenceId: referenceId,
  }));
