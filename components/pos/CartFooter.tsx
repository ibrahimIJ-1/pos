"use client"

import React from "react";
import CheckoutButton from "./CheckoutButton";
import { CardFooter } from "../ui/card";
import { usePOS } from "@/providers/POSProvider";
import { useSystem } from "@/providers/SystemProvider";

function CartFooter() {
  const { storeCurrency } = useSystem();
  const { cart,trans } = usePOS();
  return (
    <CardFooter className="flex-col pt-6">
      <div className="w-full space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Subtotal")}</span>
          <span>{storeCurrency} {cart?.subtotal?.toFixed(2) || "0.00"}</span>
        </div>
        {(cart?.discountTotal ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{trans("Discount")}</span>
            <span>-{storeCurrency} {cart ? cart.discountTotal.toFixed(2) : 0}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{trans("Tax")}</span>
          <span>{storeCurrency} {cart?.taxTotal?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>{trans("Total")}</span>
          <span>{storeCurrency} {cart?.totalAmount?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
      {/* <PermissionGuard
                userRole={UserRole.CASHIER}
                permission={Permission.CREATE_SALE}
              > */}
      <CheckoutButton />
      {/* </PermissionGuard> */}
    </CardFooter>
  );
}

export default CartFooter;
