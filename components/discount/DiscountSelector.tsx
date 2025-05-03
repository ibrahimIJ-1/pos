"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Percent, Tag, Search, Calendar } from "lucide-react";
import { DiscountType } from "@prisma/client";
import { usePOSDiscounts } from "@/lib/discounts-service";
import { usePOS } from "@/providers/POSProvider";
import { useSystem } from "@/providers/SystemProvider";

interface DiscountSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDiscount: (discount: any) => void;
}

export function DiscountSelector({
  open,
  onOpenChange,
  onSelectDiscount,
}: DiscountSelectorProps) {
  const { storeCurrency } = useSystem();
  const { trans } = usePOS();
  const { data: discounts = [], isLoading } = usePOSDiscounts();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter discounts by active status and search term
  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.isActive &&
      (discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discount.code &&
          discount.code.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Filter out expired discounts or those that have reached max uses
  const validDiscounts = filteredDiscounts.filter((discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    const isValidDate = now >= startDate && (!endDate || now <= endDate);
    const isValidUses =
      !discount.maxUses || discount.currentUses < discount.maxUses;

    return isValidDate && isValidUses;
  });

  const getDiscountTypeDisplay = (type: DiscountType, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}% off`;
      case "FIXED":
        return `${storeCurrency} ${value.toFixed(2)} off`;
      case "BUY_X_GET_Y":
        return "Buy X Get Y Free";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {trans("Apply Discount")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={trans("Search discounts") + "..."}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-72">
            <div className="space-y-1">
              {validDiscounts.length > 0 ? (
                validDiscounts.map((discount) => (
                  <Button
                    key={discount.id}
                    variant="ghost"
                    className="w-full flex flex-col items-start justify-start space-y-1 p-4 font-normal h-auto"
                    onClick={() => {
                      onSelectDiscount(discount);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{discount.name}</span>
                      {discount.code && (
                        <Badge variant="outline">{discount.code}</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {discount.type === "PERCENTAGE" ? (
                        <Percent className="h-3 w-3" />
                      ) : (
                        <Tag className="h-3 w-3" />
                      )}
                      <span>
                        {getDiscountTypeDisplay(discount.type, discount.value)}
                      </span>

                      <div className="flex items-center gap-1 ml-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {trans("Valid until")}:{" "}
                          {discount.endDate
                            ? format(new Date(discount.endDate), "MMM d")
                            : trans("No end date")}
                        </span>
                      </div>
                    </div>

                    {discount.minPurchaseAmount && (
                      <span className="text-xs text-muted-foreground">
                        {trans("Min")}. {trans("purchase")}: {storeCurrency}
                        {discount.minPurchaseAmount.toFixed(2)}
                      </span>
                    )}
                  </Button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {isLoading
                    ? trans("Loading discounts") + "..."
                    : searchTerm
                    ? `${trans("No discounts found matching")} "${searchTerm}"`
                    : trans("No active discounts available")}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {trans("Cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
