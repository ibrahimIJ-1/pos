"use client";

import { User } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useRefund } from "@/providers/RefundProvider";

function SelectedCustomer() {
  const { sale, trans } = useRefund();
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">
              {sale?.customer ? sale?.customer.name : trans("Guest Customer")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {}}
            >
              <User className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectedCustomer;
