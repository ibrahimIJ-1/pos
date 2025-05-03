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
import { CreditCard, DollarSign, Wallet } from "lucide-react";
import { NumberInput } from "../ui/number-input";
import { CartItem } from "@prisma/client";
import { usePOS } from "@/providers/POSProvider";
import { useSystem } from "@/providers/SystemProvider";

function PaymentDialog() {
  const { storeCurrency } = useSystem();
  const {
    cart,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    calculateChange,
    createSaleMutation,
    handleCompleteSale,
    trans,
  } = usePOS();

  return (
    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
      <DialogContent
        className="sm:max-w-md border-neon-purple/30"
        dir={trans("dir")}
      >
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {trans("Payment")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={paymentMethod === "credit_card" ? "default" : "outline"}
              className={`flex-1 gap-2 ${
                paymentMethod === "credit_card"
                  ? "bg-neon-purple hover:bg-neon-purple/90"
                  : ""
              }`}
              onClick={() => setPaymentMethod("credit_card")}
            >
              <CreditCard className="h-4 w-4" />
              {trans("Credit Card")}
            </Button>
            <Button
              variant={paymentMethod === "cash" ? "default" : "outline"}
              className={`flex-1 gap-2 ${
                paymentMethod === "cash"
                  ? "bg-neon-purple hover:bg-neon-purple/90"
                  : ""
              }`}
              onClick={() => setPaymentMethod("cash")}
            >
              <DollarSign className="h-4 w-4" />
              {trans("Cash")}
            </Button>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {trans("Cash Received")}
              </label>
              <NumberInput
                min={cart?.totalAmount}
                step={1}
                value={cashReceived}
                onChange={(value) => setCashReceived(value)}
                className="w-full"
              />

              <div className="flex justify-between font-medium">
                <span>{trans("Change")}</span>
                <span>
                  {storeCurrency} {calculateChange().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-muted rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{trans("Items")}</span>
              <span>
                {(cart?.items as CartItem[])?.reduce(
                  (acc, item) => acc + item.quantity,
                  0
                ) || 0}
              </span>
            </div>
            {(cart?.discountTotal ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{trans("Discount")}</span>
                <span>
                  -{storeCurrency} {cart?.discountTotal.toFixed(2) || 0}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>{trans("Total")}</span>
              <span>
                {storeCurrency} {cart?.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsPaymentDialogOpen(false)}
          >
            {trans("Cancel")}
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={createSaleMutation.isPending}
            className="gap-2 bg-neon-purple hover:bg-neon-purple/90"
          >
            <Wallet className="h-4 w-4" />
            {createSaleMutation.isPending
              ? trans("Processing") + "..."
              : trans("Complete Sale")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentDialog;
