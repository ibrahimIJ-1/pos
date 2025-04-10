"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
} from "lucide-react";
import CartSelector from "@/components/pos/CartSelector";
import CartFooter from "@/components/pos/CartFooter";
import CartItems from "@/components/pos/CartItems";
import CustomerSelectorDialog from "./CustomerSelectorDialog";
import DiscountSelectorDialog from "./DiscountSelectorDialog";

function FullCart() {
  return (
    <div>
      <Card className="neon-card border-neon-purple/30 dark:border-neon-purple/20 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex justify-between items-center">
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Current Sale</span>
              </div>
              <CartSelector />
            </div>
          </CardTitle>

          <CustomerSelectorDialog />
          <DiscountSelectorDialog />
        </CardHeader>
        <CardContent className="pb-0">
          <CartItems />
        </CardContent>
        <CartFooter />
      </Card>
    </div>
  );
}

export default FullCart;
