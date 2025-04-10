"use client"

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InvoicePrint from "../invoice/InvoicePrint";
import { usePOS } from "@/providers/POSProvider";

function InvoicePrintDialog() {
  const { isInvoiceOpen, setIsInvoiceOpen, lastCompletedSale } = usePOS();

  return (
    <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 border-neon-purple/30">
        {lastCompletedSale && (
          <InvoicePrint
            data={lastCompletedSale}
            onClose={() => setIsInvoiceOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InvoicePrintDialog;
