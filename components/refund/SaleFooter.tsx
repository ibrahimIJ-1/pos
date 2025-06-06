"use client";

import React from "react";
import { CardFooter } from "../ui/card";
import { useRefund } from "@/providers/RefundProvider";
import { useSystem } from "@/providers/SystemProvider";

function SaleFooter() {
  const { storeCurrency } = useSystem();
  const { sale, trans } = useRefund();
  return (
    <CardFooter className="flex-col pt-6">
      <div className="w-full space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Subtotal")}</span>
          <span>{storeCurrency} {sale?.subtotal?.toFixed(2) || "0.00"}</span>
        </div>
        {(sale?.discountTotal ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{trans("Discount")}</span>
            <span>-{storeCurrency} {sale ? sale.discountTotal.toFixed(2) : 0}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Tax")}</span>
          <span>{storeCurrency} {sale?.taxTotal?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>{trans("Total")}</span>
          <span>{storeCurrency} {sale?.totalAmount?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
    </CardFooter>
  );
}

export default SaleFooter;
