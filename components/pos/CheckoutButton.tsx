"use client"

import React from "react";
import { Button } from "../ui/button";
import { Receipt } from "lucide-react";
import { CartItem } from "@prisma/client";
import { usePOS } from "@/providers/POSProvider";

function CheckoutButton() {
  const { cart, createSaleMutation,handleCheckout } = usePOS();
  return (
    <Button
      className="w-full neon-glow animate-glow bg-neon-purple hover:bg-neon-purple/90"
      size="lg"
      disabled={
        !(cart?.items as CartItem[])?.length || createSaleMutation.isPending
      }
      onClick={handleCheckout}
    >
      {createSaleMutation.isPending ? (
        "Processing..."
      ) : (
        <>
          <Receipt className="h-4 w-4 mr-2" />
          Checkout
        </>
      )}
    </Button>
  );
}

export default CheckoutButton;
