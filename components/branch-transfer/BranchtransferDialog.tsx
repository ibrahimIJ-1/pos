import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BranchTransferForm } from "./BranchTransferForm";
import { useTranslations } from "next-intl";
import { WarehouseTransactionRow } from "@/lib/types/warehouse-transaction-types";

interface BranchTransferDialogProps {
  branchTransfer?: WarehouseTransactionRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BranchTransferDialog({
  branchTransfer,
  open,
  onOpenChange,
  onSuccess,
}: BranchTransferDialogProps) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-start">
            {branchTransfer ? t("Edit BranchTransfer") : t("Add New BranchTransfer")}
          </DialogTitle>
        </DialogHeader>
        <BranchTransferForm
          id={branchTransfer?.id}
          initialData={branchTransfer as any}
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
