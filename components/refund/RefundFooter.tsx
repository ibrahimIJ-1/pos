"use client";

import React from "react";
import { CardFooter } from "../ui/card";
import { useRefund } from "@/providers/RefundProvider";
import RefundButton from "./RefundButton";

function RefundFooter() {
  const { refund, trans } = useRefund();
  return (
    <CardFooter className="flex-col pt-6">
      <div className="w-full space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Subtotal")}</span>
          <span>${refund?.subtotal?.toFixed(2) || "0.00"}</span>
        </div>
        {Number(refund?.discountTotal ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{trans("Discount")}</span>
            <span>-${refund ? refund.discountTotal?.toFixed(2) : 0}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Tax")}</span>
          <span>${refund?.taxTotal?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>{trans("Total")}</span>
          <span>${refund?.totalAmount?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
      <RefundButton />
    </CardFooter>
  );
}

export default RefundFooter;
