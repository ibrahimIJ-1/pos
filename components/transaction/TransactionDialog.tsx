import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionForm from "./TransactionForm";
import { useTranslations } from "next-intl";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: TransactionDialogProps) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={t("dir")}>
        <DialogHeader className="text-start">
          <DialogTitle className="rtl:text-start">
            {t("Add New Transaction")}
          </DialogTitle>
          <DialogDescription className="rtl:text-start">
            {t(
              "Enter the details of the new transaction to record in the system"
            )}
            .
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSuccess={() => {
            onOpenChange(false);
            if (onSuccess) onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDialog;
