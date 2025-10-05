import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockInForm } from "./StockInForm";
import { useTranslations } from "next-intl";
import { WarehouseTransactionRow } from "@/lib/types/warehouse-transaction-types";

interface StockInDialogProps {
  stockIn?: WarehouseTransactionRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StockInDialog({
  stockIn,
  open,
  onOpenChange,
  onSuccess,
}: StockInDialogProps) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-start">
            {stockIn ? t("Edit StockIn") : t("Add New StockIn")}
          </DialogTitle>
        </DialogHeader>
        <StockInForm
          id={stockIn?.id}
          initialData={stockIn as any}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
