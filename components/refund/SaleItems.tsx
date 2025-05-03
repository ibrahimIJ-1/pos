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
import { useSystem } from "@/providers/SystemProvider";

function SaleItems() {
  const { storeCurrency } = useSystem();
  const { saleItems, trans } = useRefund();
  return (
    <ScrollArea
      className="h-[calc(90vh-26rem)]"
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
          {saleItems.map((item) => (
            <TableRow key={item.productId}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-right">
                {storeCurrency} {item?.unitPrice.toString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <span className="w-6 text-center">{item.quantity}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {storeCurrency} {(Number(item.unitPrice) * item.quantity).toFixed(2)}
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

export default SaleItems;
