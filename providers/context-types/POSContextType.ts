import { useCartOperations, useMultiCartOperations } from "@/lib/pos-service";
import { ProductPOS } from "@/lib/product-branch-mapper";
import {
  Cart,
  CartItem,
  Customer,
  Discount,
  Sale,
  SaleItem,
} from "@prisma/client";
import { UseMutationResult } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

export interface POSContextType {
  isInvoiceOpen: boolean;
  setIsInvoiceOpen: Dispatch<SetStateAction<boolean>>;
  lastCompletedSale: any;
  setLastCompletedSale: Dispatch<SetStateAction<any>>;
  isDiscountDialogOpen: boolean;
  setIsDiscountDialogOpen: Dispatch<SetStateAction<boolean>>;
  cart: Cart & CartItem[] & Discount & any; //TODO: CART TYPE
  handleApplyDiscount: (discount: Discount) => void;
  handleRemoveDiscount: () => void;
  isCustomerDialogOpen: boolean;
  setIsCustomerDialogOpen: Dispatch<SetStateAction<boolean>>;
  removeCustomer: () => void;
  customers: Customer[];
  handleCustomerSelect: (customer: Customer) => void;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: Dispatch<SetStateAction<boolean>>;
  paymentMethod: string;
  setPaymentMethod: Dispatch<SetStateAction<string>>;
  cashReceived: number;
  setCashReceived: Dispatch<SetStateAction<number>>;
  calculateChange: () => number;
  createSaleMutation: UseMutationResult<
    unknown,
    Error,
    {
      newSale: Sale;
      items: SaleItem[];
    },
    unknown
  >;
  handleCompleteSale: () => void;
  isCartsPopoverOpen: boolean;
  setIsCartsPopoverOpen: Dispatch<SetStateAction<boolean>>;
  multiCart: any; //TODO: multicart type
  getShortCartId: (cartId: string) => string;
  handleSwitchCart: (cartId: string) => void;
  multiCartOps: ReturnType<typeof useMultiCartOperations>;
  getCartItemCount: (cartId: string) => number;
  handleDuplicateCart: (cartId: string) => void;
  handleRemoveCart: (cartId: string) => void;
  handleAddCart: () => void;
  clearCart: () => void;
  cartOps: ReturnType<typeof useCartOperations>;
  handleCheckout: () => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  products: ProductPOS[];
  addItemToCart: (product: any) => void;
  inputRef: React.RefObject<null>;
  showImage: boolean;
}
