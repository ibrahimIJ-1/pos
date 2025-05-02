"use client";

import React from "react";
import { DiscountSelector } from "../discount/DiscountSelector";
import { Percent, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem } from "@prisma/client";
import { useRefund } from "@/providers/RefundProvider";

function SelectedDiscount() {
  const { sale, trans } = useRefund();
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate">
            {sale?.discount?.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {}}
          >
            <Tag className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SelectedDiscount;
