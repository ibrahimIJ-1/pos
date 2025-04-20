"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";
import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import {
  useCart,
  useCartOperations,
  useCreateSale,
  useCustomers,
  useMultiCart,
  useMultiCartOperations,
  usePOSProducts,
  useProducts,
} from "@/lib/pos-service";
import {
  Cart,
  CartItem,
  Customer,
  Discount,
  Product,
  Sale,
  SaleItem,
} from "@prisma/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";
import MacNotFound from "@/app/mac-not-found";
import { POSContextType } from "./context-types/POSContextType";
import { getPOSSettings, getStoreSettings } from "@/lib/settings-service";

export const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: cart } = useCart();
  const cartOps = useCartOperations();
  const { data: customers = [] } = useCustomers();
  const createSaleMutation = useCreateSale();
  const { data: multiCart } = useMultiCart();
  const multiCartOps = useMultiCartOperations();
  const { data: products = [] } = usePOSProducts();

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<any>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isCartsPopoverOpen, setIsCartsPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImage, setShowImage] = useState(false);

  const scannedData = useRef("");
  const inputRef = useRef(null);

  const handleApplyDiscount = (discount: Discount) => {
    if (cart)
      cartOps.applyDiscount.mutate({
        discountId: discount.id,
        cartId: cart.id,
      });
  };

  const handleRemoveDiscount = () => {
    if (cart) cartOps.removeDiscount.mutate(cart.id);
  };

  const removeCustomer = () => {
    if (cart) {
      cartOps.setCustomer.mutate({
        customerId: undefined,
        customerName: undefined,
        cartId: cart.id,
      });
      toast.success("Customer removed");
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (cart) {
      cartOps.setCustomer.mutate({
        customerId: customer.id,
        customerName: customer.name,
        cartId: cart.id,
      });
      setIsCustomerDialogOpen(false);
      toast.success(`Customer: ${customer.name}`);
    }
  };

  const calculateChange = () => {
    return cashReceived - (cart ? cart?.totalAmount : 0);
  };

  const handleCompleteSale = () => {
    const saleDate = new Date().toISOString();

    const saleItems: SaleItem[] = (cart?.items as CartItem[]).map(
      (item: CartItem) =>
        ({
          id: `item-${Date.now()}-${item.productId}`,
          saleId: "", // This will be assigned by the backend
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: cart?.discountTotal
            ? cart.discountTotal / (cart?.items as CartItem[]).length
            : 0, // Simple proration of discount
          taxAmount:
            (item.price ? Number(item.price) : 0) *
            (item.quantity ?? 0) *
            (item.taxRate ? Number(item.taxRate) : 0),
          subtotal: (item.price ? Number(item.price) : 0) * item.quantity,
        } as unknown as SaleItem)
    );

    const newSale: any = {
      //   id: invoiceId,
      date: saleDate,
      customerId: cart ? cart.customer?.id ?? null : null,
      subtotal: cart ? cart.subtotal : 0,
      taxTotal: cart ? cart.taxTotal : 0,
      discountTotal: cart ? cart.discountTotal : 0,
      totalAmount: cart ? cart.totalAmount : 0,
      paymentMethod: paymentMethod,
      paymentStatus: "paid" as const,
      notes: "",
      // created_at: Date.now(),
      // updated_at: Date.now(),
      // saleNumber: "1",
    };
    createSaleMutation.mutate(
      { newSale, items: saleItems },
      {
        onSuccess: (data: any) => {
          setIsPaymentDialogOpen(false);
          setLastCompletedSale({ ...newSale, ...data });
          setIsInvoiceOpen(true);
          if (cart) cartOps.clearCart.mutate({ cartId: cart.id });
        },
      }
    );
  };

  const getShortCartId = (cartId: string) => {
    // return cartId.split("-")[2] || cartId.slice(-4);
    return cartId;
  };

  const handleSwitchCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) {
      multiCartOps.switchCart.mutate(cart.id);
      setIsCartsPopoverOpen(false);
    }
  };

  const getCartItemCount = (cartId: any) => {
    if (!multiCart || !multiCart.carts[cartId]) return 0;
    return (multiCart.carts[cartId] as any).items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
  };

  const handleDuplicateCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) {
      multiCartOps.duplicateCart.mutate(cart.id);
      setIsCartsPopoverOpen(false);
    }
  };

  const handleRemoveCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) multiCartOps.removeCart.mutate(cart.id);
  };

  const handleAddCart = () => {
    multiCartOps.addCart.mutate();
    setIsCartsPopoverOpen(false);
  };

  const clearCart = () => {
    if (cart) cartOps.clearCart.mutate({ cartId: cart.id });
  };

  const handleCheckout = () => {
    if ((cart?.items as CartItem[]).length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setCashReceived(cart ? cart.totalAmount : 0);
    setIsPaymentDialogOpen(true);
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (cart)
      cartOps.updateQuantity.mutate({
        cartId: cart.id,
        itemId,
        quantity: quantity,
      });
  };

  const addItemToCart = useCallback(
    (product: any) => {
      if (cart)
        cartOps.addItem.mutate(
          { product, cartId: cart.id },
          {
            onSettled: (data: any) => {},
          }
        );
    },
    [cart, cartOps.addItem] // Dependencies for useCallback
  );

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key.length === 1 && event.key !== "Enter") {
        scannedData.current += event.key; // Append the character to the scanned data
      }
      if (event.key === "Enter") {
        const prod = products.find((p) => p.barcode == scannedData.current);
        if (prod) addItemToCart(prod);
        if (inputRef.current) (inputRef.current as HTMLInputElement)?.focus();
        scannedData.current = "";
        setSearchTerm(scannedData.current);
      }
    };

    // Add the event listener to the document
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addItemToCart, products]);

  useEffect(() => {
    getStoreSettings().then((data) => {
      if (data && data.productImages === "true") {
        console.log(data.productImages);
        
        setShowImage(true);
      }
    });
  }, []);

  const { macAddress, macLoading } = useAuth();
  console.log(macAddress);

  return (
    <POSContext.Provider
      value={{
        isInvoiceOpen,
        setIsInvoiceOpen,
        lastCompletedSale,
        setLastCompletedSale,
        isDiscountDialogOpen,
        setIsDiscountDialogOpen,
        cart,
        handleApplyDiscount,
        handleRemoveDiscount,
        isCustomerDialogOpen,
        setIsCustomerDialogOpen,
        removeCustomer,
        customers,
        handleCustomerSelect,
        isPaymentDialogOpen,
        setIsPaymentDialogOpen,
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        calculateChange,
        createSaleMutation,
        handleCompleteSale,
        isCartsPopoverOpen,
        setIsCartsPopoverOpen,
        multiCart,
        getShortCartId,
        handleSwitchCart,
        multiCartOps,
        getCartItemCount,
        handleDuplicateCart,
        handleRemoveCart,
        handleAddCart,
        clearCart,
        cartOps,
        handleCheckout,
        updateCartItemQuantity,
        searchTerm,
        setSearchTerm,
        products,
        addItemToCart,
        inputRef,
        showImage,
      }}
    >
      {macLoading ? Loading() : !macAddress ? MacNotFound() : children}
    </POSContext.Provider>
  );
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within an POSProvider");
  }
  return context;
};
