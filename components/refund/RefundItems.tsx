"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "../Logo";
import { useRefund } from "@/providers/RefundProvider";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function RefundItems() {
  const { refundItems, trans, changeItemQuantity } = useRefund();
  return (
    <ScrollArea
      className="h-[calc(90vh-30rem)]"
      dir={trans("dir") as "rtl" | "ltr"}
    >
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {refundItems.map((item) => (
            <TableRow
              key={item.productId}
              className={cn(
                item.fullQuantity == item.refundedQuantity
                  ? "bg-pink-100 hover:bg-pink-100 dark:bg-pink-800 dark:hover:bg-pink-800 dark:text-white"
                  : (item.fullQuantity ?? 0) > (item.refundedQuantity ?? 0) &&
                    (item.refundedQuantity ?? 0) > 0
                  ? "bg-yellow-100 hover:bg-yellow-100 dark:bg-yellow-500 dark:hover:bg-yellow-500 dark:text-white"
                  : ""
              )}
            >
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-right">
                ${item?.unitPrice.toString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={
                      item.quantity == 0 ||
                      item.refundedQuantity == item.fullQuantity
                    }
                    onClick={() =>
                      changeItemQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={
                      item.fullQuantity == item.refundedQuantity ||
                      item.quantity ==
                        (item.fullQuantity ?? 0) - (item.refundedQuantity ?? 0)
                    }
                    onClick={() =>
                      changeItemQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Logo
        width={400}
        className="opacity-15 absolute top-1/2 -translate-x-1/2 left-1/2 pointer-events-none"
      />
    </ScrollArea>
  );
}

export default RefundItems;
