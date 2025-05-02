"use client";

import { Barcode, Search } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRefund } from "@/providers/RefundProvider";

function RefundSelector() {
  const {
    searchTerm,
    setSearchTerm,
    trans,
    checkRefundSale
  } = useRefund();

  return (
    <div className="lg:col-span-2 space-y-4 h-[-webkit-fill-available] flex flex-col">
      {/* Search Bar Section */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={"EX:20250502-0002"}
            className="pl-10 pr-2 h-11 neon-input border-neon-purple/30 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="neon-border h-11 w-full sm:w-auto px-4"
          onClick={checkRefundSale}
        >
          <Barcode className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">{trans("Scan")}</span>
        </Button>
      </div>
    </div>
  );
}

export default RefundSelector;
