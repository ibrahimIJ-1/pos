import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, User } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { usePOS } from "@/providers/POSProvider";

function CustomerSelector() {
  const {
    isCustomerDialogOpen,
    setIsCustomerDialogOpen,
    customers,
    handleCustomerSelect,
    trans
  } = usePOS();
  return (
    <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
      <DialogContent className="sm:max-w-md" dir={trans("dir") as "rtl" | "ltr"}>
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {trans("Select Customer")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={trans("Search customers") + "..."}
              className="pl-8 neon-input"
            />
          </div>

          <ScrollArea className="h-72">
            <div className="space-y-1">
              {customers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className="w-full justify-start font-normal gap-2"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span>{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.email || customer.phone || "No contact info"}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsCustomerDialogOpen(false)}
          >
            {trans("Cancel")}
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            {trans("New Customer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerSelector;
