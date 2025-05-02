import { useRefundOperations } from "@/lib/refund-service";
import { Refund, RefundItem, SaleItem } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { RefundItemWithStatus } from "../RefundProvider";

export interface RefundContextType {
  isRefundDialogOpen: boolean;
  setIsRefundDialogOpen: Dispatch<SetStateAction<boolean>>;
  handleCompleteRefund: () => void;
  checkRefundSale: () => void;
  sale: any | null;
  saleItems: SaleItem[];
  refundItems: RefundItemWithStatus[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  refund: Partial<Refund> | null;
  trans: ReturnType<typeof useTranslations>;
  changeItemQuantity: (productId: string, quantity: number) => void;
  refundOps: ReturnType<typeof useRefundOperations>;
}
