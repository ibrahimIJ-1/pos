import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "./CustomerForm";
import { Customer } from "@prisma/client";
import { useTranslations } from "next-intl";

interface CustomerDialogProps {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: CustomerDialogProps) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-start">
            {customer ? t("Edit Customer") : t("Add New Customer")}
          </DialogTitle>
        </DialogHeader>
        <CustomerForm
          id={customer?.id}
          initialData={customer}
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
