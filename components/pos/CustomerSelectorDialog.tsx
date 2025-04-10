"use client"

import { usePOS } from "@/providers/POSProvider";
import { User, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import CustomerSelector from "../customer/CustomerSelector";

function CustomerSelectorDialog() {
  const {
    cart,
    isCustomerDialogOpen,
    setIsCustomerDialogOpen,
    removeCustomer,
  } = usePOS();
  return (
    <>
      <div className="flex items-center gap-2">
        {cart?.customer ? (
          <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">
                {cart.customer.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCustomerDialogOpen(true)}
              >
                <User className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={removeCustomer}
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
            onClick={() => setIsCustomerDialogOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        )}
      </div>
      <CustomerSelector />
    </>
  );
}

export default CustomerSelectorDialog;
