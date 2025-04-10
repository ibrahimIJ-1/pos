"use client"

import React from "react";
import { DiscountSelector } from "../discount/DiscountSelector";
import { usePOS } from "@/providers/POSProvider";
import { Percent, Tag, X } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem } from "@prisma/client";

function DiscountSelectorDialog() {
  const {
    isDiscountDialogOpen,
    setIsDiscountDialogOpen,
    handleApplyDiscount,
    cart,
    handleRemoveDiscount,
  } = usePOS();
  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        {cart?.discount ? (
          <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">
                {cart.discount.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsDiscountDialogOpen(true)}
              >
                <Tag className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={handleRemoveDiscount}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start"
            onClick={() => setIsDiscountDialogOpen(true)}
            disabled={(cart?.items as CartItem[])?.length === 0}
          >
            <Tag className="h-4 w-4 mr-2" />
            Apply Discount
          </Button>
        )}
      </div>
      <DiscountSelector
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        onSelectDiscount={handleApplyDiscount}
      />
    </>
  );
}

export default DiscountSelectorDialog;
