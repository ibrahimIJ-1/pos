"use client";

import React from "react";
import { Button } from "../ui/button";
import { Receipt } from "lucide-react";
import { CartItem } from "@prisma/client";
import { usePOS } from "@/providers/POSProvider";
import { useRefund } from "@/providers/RefundProvider";

function RefundButton() {
  const { trans, refund, setIsRefundDialogOpen, refundOps } = useRefund();
  return (
    <Button
      className="w-full neon-glow animate-glow bg-neon-purple hover:bg-neon-purple/90"
      size="lg"
      disabled={
        !refund ||
        Number(refund.totalAmount) == 0 ||
        refundOps.createRefund.isPending
      }
      onClick={() => setIsRefundDialogOpen(true)}
    >
      {refundOps.createRefund.isPending ? (
        trans("Processing") + "..."
      ) : (
        <>
          <Receipt className="h-4 w-4 mr-2" />
          {trans("Refund")}
        </>
      )}
    </Button>
  );
}

export default RefundButton;
