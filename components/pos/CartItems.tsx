"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@prisma/client";
import { usePOS } from "@/providers/POSProvider";
import { Button } from "../ui/button";
import { Minus, Plus, ShoppingCart, Trash } from "lucide-react";
import Logo from "../Logo";
import { useSystem } from "@/providers/SystemProvider";

function CartItems() {
  const { storeCurrency } = useSystem();
  const { cart, cartOps, updateCartItemQuantity, trans } = usePOS();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(1);

  return (
    <ScrollArea
      className="h-[calc(90vh-26rem)]"
      dir={trans("dir") as "rtl" | "ltr"}
    >
      {((cart?.items as CartItem[])?.length
        ? (cart?.items as CartItem[]).length
        : 0) > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="rtl:text-start">{trans("Item")}</TableHead>
              <TableHead className="text-right rtl:text-start">
                {trans("Price")}
              </TableHead>
              <TableHead className="text-center rtl:text-start">
                {trans("Qty")}
              </TableHead>
              <TableHead className="text-right rtl:text-start">
                {trans("Total")}
              </TableHead>
              <TableHead className="text-right rtl:text-start">
                {trans("Clear")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(cart?.items as CartItem[]).map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {storeCurrency} {item?.price.toString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={cartOps.updateQuantity.isPending}
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        className="w-12 text-center border rounded"
                        value={editValue === 0 ? "" : editValue}
                        min={1}
                        onChange={(e) => {
                          // Allow empty string for editing, otherwise parse as number and remove leading zeros
                          const val = e.target.value;
                          if (val === "") {
                            setEditValue(0);
                          } else {
                            setEditValue(Number(val.replace(/^0+/, "")));
                          }
                        }}
                        onBlur={() => {
                          const valueToSet = editValue > 0 ? editValue : 1;
                          updateCartItemQuantity(item.id, valueToSet);
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const valueToSet = editValue > 0 ? editValue : 1;
                            updateCartItemQuantity(item.id, valueToSet);
                            setEditingId(null);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="w-6 text-center cursor-pointer"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditValue(item.quantity);
                        }}
                      >
                        {item.quantity}
                      </span>
                    )}{" "}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={cartOps.updateQuantity.isPending}
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {storeCurrency}{" "}
                  {(Number(item.price) * item.quantity).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={cartOps.updateQuantity.isPending}
                      onClick={() => updateCartItemQuantity(item.id, 0)}
                    >
                      <Trash className="h-3 w-3" color="red" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mb-2" />
          <p>{trans("No items in cart")}</p>
          <p className="text-sm">{trans("Add products by clicking on them")}</p>
        </div>
      )}
      <Logo
        width={400}
        className="opacity-15 absolute top-1/2 -translate-x-1/2 left-1/2 pointer-events-none"
      />
    </ScrollArea>
  );
}

export default CartItems;
