"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Copy, List, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem } from "@prisma/client";
import { usePOS } from "@/providers/POSProvider";

function CartSelector() {
  const {
    cart,
    multiCart,
    isCartsPopoverOpen,
    setIsCartsPopoverOpen,
    getShortCartId,
    handleSwitchCart,
    getCartItemCount,
    handleDuplicateCart,
    handleRemoveCart,
    handleAddCart,
    clearCart,
    trans
  } = usePOS();
  return (
    <div className="flex gap-1 items-center">
      <Popover open={isCartsPopoverOpen} onOpenChange={setIsCartsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 px-2">
            <List className="h-4 w-4 mr-1" />
            {multiCart && (
              <span>
                {trans("Cart")} #{getShortCartId(multiCart.activeCartId ?? "")}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-64" align="start">
          <div className="p-3 border-b">
            <h3 className="font-medium">{trans("Manage Carts")}</h3>
            <p className="text-sm text-muted-foreground">
              {trans("Switch between or create new carts")}
            </p>
          </div>

          {multiCart && (
            <ScrollArea className="max-h-64" dir={trans("dir") as "rtl" | "ltr"}>
              <div className="p-1">
                {Object.keys(multiCart.carts).map((cartId) => (
                  <div
                    key={cartId}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      cartId === multiCart.activeCartId
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <button
                      className="flex items-center gap-2 text-left flex-1"
                      onClick={() => handleSwitchCart(cartId)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <div>
                        <div className="font-medium">
                          {trans("Cart")} #{getShortCartId(cartId)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getCartItemCount(cartId)} {trans("items")} | $
                          {/* {multiCart?.carts[cartId]?.items.toFixed(
                                          2
                                        )} */}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDuplicateCart(cartId)}
                        title={trans("Duplicate cart")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      {Object.keys(multiCart.carts).length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCart(cartId)}
                          title={trans("Remove cart")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="p-2 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAddCart}
            >
              <Plus className="h-4 w-4 mr-2" />
              {trans("New Cart")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-destructive"
        onClick={() => clearCart()}
        disabled={(cart?.items as CartItem[])?.length === 0}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {trans("Clear")}
      </Button>
    </div>
  );
}

export default CartSelector;
