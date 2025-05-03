"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Wallet } from "lucide-react";
import { NumberInput } from "../ui/number-input";
import { useRefund } from "@/providers/RefundProvider";
import { useSystem } from "@/providers/SystemProvider";

function RefundDialog() {
  const { storeCurrency } = useSystem();
  const {
    refund,
    handleCompleteRefund,
    refundOps,
    isRefundDialogOpen,
    setIsRefundDialogOpen,
    trans,
  } = useRefund();

  return (
    <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
      <DialogContent
        className="sm:max-w-md border-neon-purple/30"
        dir={trans("dir")}
      >
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {trans("Refund")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {trans("Cash Received")}
            </label>
            <NumberInput
              step={1}
              disabled={true}
              value={Number(refund?.totalAmount??0)}
              className="w-full"
            />
          </div>

          <div className="bg-muted rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{trans("Items")}</span>
              <span>{Number(refund?.subtotal??0)}</span>
            </div>

            <div className="flex justify-between font-bold">
              <span>{trans("Total")}</span>
              <span>{storeCurrency} {refund?.totalAmount?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsRefundDialogOpen(false)}
          >
            {trans("Cancel")}
          </Button>
          <Button
            onClick={handleCompleteRefund}
            disabled={refundOps.createRefund.isPending}
            className="gap-2 bg-neon-purple hover:bg-neon-purple/90"
          >
            <Wallet className="h-4 w-4" />
            {refundOps.createRefund.isPending
              ? trans("Processing") + "..."
              : trans("Complete Refund")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RefundDialog;
