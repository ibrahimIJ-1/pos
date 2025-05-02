"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Refund, RefundItem, Sale, SaleItem } from "@prisma/client";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";
import MacNotFound from "@/app/mac-not-found";
import { useTranslations } from "next-intl";
import { RefundContextType } from "./context-types/RefundContextType";
import { useRefundOperations } from "@/lib/refund-service";
import Decimal from "decimal.js";
import { toast } from "sonner";

export const RefundContext = createContext<RefundContextType | undefined>(
  undefined
);
export type RefundItemWithStatus = RefundItem & {
  refundedQuantity?: number;
  fullQuantity?: number;
};
export function RefundProvider({ children }: { children: ReactNode }) {
  const trans = useTranslations();
  const queryClient = useQueryClient();
  const refundOps = useRefundOperations();
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [refund, setRefund] = useState<Partial<Refund> | null>(null);
  const [refundItems, setRefundItems] = useState<RefundItemWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const scannedData = useRef("");
  const inputRef = useRef(null);

  const checkRefundSale = () => {
    if (!searchTerm || searchTerm == "") return;
    refundOps.checkRefund.mutate(
      { saleNumber: searchTerm },
      {
        onSuccess: (data: any) => {
          setSale(data);
          setSaleItems(data.items);
          setRefundItems(
            data.items.map((item: any) => ({
              ...item,
              quantity: 0,
              saleItemId: item.id,
              fullQuantity:item.quantity
            }))
          );
          setRefund({
            branchId: data?.branchId,
            cashierId: data?.cashierId,
            customerId: data?.customerId,
            paymentMethod: data?.paymentMethod,
            saleId: data?.id,
            subtotal: Decimal(0),
            taxTotal: Decimal(0),
            totalAmount: Decimal(0),
            discountTotal: Decimal(0),
          });
        },
        onError: (error) => {
          
          setSale(null);
          setSaleItems([]);
          setRefund(null);
          setRefundItems([]);
          toast.error(error.message);
          
        },
      }
    );
  };

  const changeItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    const item = saleItems.find(
      (it) => it.productId == productId && it.quantity >= quantity
    );
    if (!item) return;
    const refItemInd = refundItems.findIndex((it) => it.productId == productId);
    setRefundItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    calculateRefund();
  };

  const refundButtonPressed = () => {};

  const handleCompleteRefund = () => {
    if (refund)
      refundOps.createRefund.mutate(
        {
          refund,
          refundItems: (refundItems as RefundItem[]).filter(
            (el) => el.quantity > 0
          ),
        },
        {
          onSuccess: (data: any) => {
            setSale(null);
            setSaleItems([]);
            setRefundItems([]);
            setRefund(null);
            setIsRefundDialogOpen(false)
            toast.success(trans("Successfull refunded, Wait for the manager to confirm"))
          },
        }
      );
  };

  const calculateRefund = () => {
    if (!refund) return;

    const total = refundItems.reduce(
      (acc, it) => it.quantity * Number(it.unitPrice) + acc,
      0
    );

    setRefund((prevRefund) => {
      if (!prevRefund) return prevRefund; // safety check
      return {
        ...prevRefund,
        subtotal: Decimal(total),
        totalAmount: Decimal(total),
      };
    });
  };

  // useEffect(() => {
  //   const handleKeyDown = (event: any) => {
  //     if (event.key.length === 1 && event.key !== "Enter") {
  //       scannedData.current += event.key; // Append the character to the scanned data
  //     }
  //     if (event.key === "Enter") {
  //       const prod = products.find((p) => p.barcode == scannedData.current);
  //       if (prod) addItemToCart(prod);
  //       if (inputRef.current) (inputRef.current as HTMLInputElement)?.focus();
  //       scannedData.current = "";
  //       setSearchTerm(scannedData.current);
  //     }
  //   };

  //   // Add the event listener to the document
  //   document.addEventListener("keydown", handleKeyDown);

  //   // Clean up the event listener on component unmount
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [addItemToCart, products]);

  useEffect(() => {
    if (refund) calculateRefund();
  }, [refundItems]);

  const { macAddress, macLoading } = useAuth();

  return (
    <RefundContext.Provider
      value={{
        isRefundDialogOpen,
        setIsRefundDialogOpen,
        sale,
        saleItems,
        refund,
        refundItems,
        searchTerm,
        setSearchTerm,
        trans,
        handleCompleteRefund,
        checkRefundSale,
        changeItemQuantity,
        refundOps,
      }}
    >
      {macLoading ? <Loading /> : !macAddress ? <MacNotFound /> : children}
    </RefundContext.Provider>
  );
}

export const useRefund = () => {
  const context = useContext(RefundContext);
  if (context === undefined) {
    throw new Error("useRefund must be used within an refundProvider");
  }
  return context;
};
