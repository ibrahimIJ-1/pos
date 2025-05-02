"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
} from "lucide-react";
import CartSelector from "@/components/pos/CartSelector";
import { useRefund } from "@/providers/RefundProvider";
import SelectedCustomer from "./SelectedCustomer";
import SelectedDiscount from "./SelectedDiscount";
import SaleItems from "./SaleItems";
import SaleFooter from "./SaleFooter";

function FullSale() {
  const {sale,trans} = useRefund();
  return (
      <Card className="neon-card border-neon-purple/30 dark:border-neon-purple/20 shadow-md h-[80vh]" dir={trans("dir")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex justify-between items-center rtl:text-start">
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>{sale?.saleNumber}</span>
              </div>
            </div>
          </CardTitle>

          <SelectedCustomer />
          <SelectedDiscount />
        </CardHeader>
        <CardContent className="pb-0">
          <SaleItems />
        </CardContent>
        <SaleFooter />
      </Card>
  );
}

export default FullSale;
