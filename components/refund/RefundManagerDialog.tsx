"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Customer,
  Refund,
  RefundItem,
  RefundStatus,
  Register,
  Sale,
} from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useBranches } from "@/lib/branches-service";
import { useCreateRegister, useUpdateRegister } from "@/lib/registers-service";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useRefundOperations } from "@/lib/refund-service";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  refund: Refund & { items: RefundItem[]; sale: Sale; customer: Customer };
}

export function RefundManagerDialog({
  open,
  onOpenChange,
  mode,
  refund,
}: RegisterDialogProps) {
  const t = useTranslations();
  const [refundStatus, setRefundStatus] = useState<RefundStatus>(
    RefundStatus.PENDING
  );
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const { changeStatus } = useRefundOperations();

  const handleConfirmation = (state: RefundStatus) => {
    setRefundStatus(state);
    setIsConfirmationDialogOpen(true);
  };

  const submit = () => {
    changeStatus.mutate(
      {
        refundId: refund!.id,
        status: refundStatus,
      },
      {
        onSuccess: () => {
          toast.success(t(refundStatus));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("Error Happened" + "..."));
        },
      }
    );
  };

  useEffect(() => {
    if (refund) setRefundStatus(refund.status);
  }, [refund]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="rtl:text-start">
              {t("Refund Detail & Status")}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea
            className="h-[calc(40vh)]"
            dir={t("dir") as "rtl" | "ltr"}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="rtl:text-start">{t("Item")}</TableHead>
                  <TableHead className="text-right rtl:text-start">
                    {t("Price")}
                  </TableHead>
                  <TableHead className="text-center rtl:text-start">
                    {t("Qty")}
                  </TableHead>
                  <TableHead className="text-right rtl:text-start">
                    {t("Total")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refund?.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item?.unitPrice.toString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-6 text-center">{item.quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">{t("Total")}</TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    ${Number(refund?.totalAmount).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
          {refundStatus == "PENDING" && (
            <div className="flex gap-4">
              <Button
                variant={"default"}
                onClick={() => handleConfirmation(RefundStatus.COMPLETED)}
              >
                {t("Approve")}
              </Button>
              <Button
                variant={"destructive"}
                onClick={() => handleConfirmation(RefundStatus.DECLINED)}
              >
                {t("Reject")}
              </Button>
            </div>
          )}
          {refundStatus == "COMPLETED" && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              key={Math.random() * 1000}
            >
              {t("Approved")}
            </Badge>
          )}

          {refundStatus == "DECLINED" && (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              key={Math.random() * 1000}
            >
              {t("Rejected")}
            </Badge>
          )}
          {refundStatus == "CANCELLED" && (
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
              key={Math.random() * 1000}
            >
              {t("Canceled")}
            </Badge>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">
              {t("Are you sure")}?
            </AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t(`This will permanently`) +
                " " +
                t(refundStatus) +
                " " +
                t(`the refund`)}{" "}
              <span className="font-medium">{refund?.sale.saleNumber}</span>.
              {t("This action cannot be undone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={submit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {changeStatus.isPending ? t("Please Wait") + "..." : t("Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
