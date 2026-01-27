import { useLiveQuery } from "dexie-react-hooks";
import { db, LocalCart, LocalCartItem } from "./db";
import { toast } from "sonner";
import { UseMutationResult } from "@tanstack/react-query";

// Use a fixed ID for the active cart for simplicity in this offline-first version
const ALL_CART_ID = "1"; // Changed to string to match schema

import { useEffect } from "react";

export function useLocalCart() {
  // 1. Query for the cart and its items (Read Only)
  const cart = useLiveQuery(async () => {
    const c = await db.cart.get(ALL_CART_ID);
    if (c) {
      const items = await db.cartItems.where({ cartId: ALL_CART_ID }).toArray();
      return { ...c, items };
    }
    return undefined; // Return undefined if not ready
  });

  // 2. Initialize cart if missing (Write Operation in Effect)
  useEffect(() => {
    const initCart = async () => {
      const exists = await db.cart.get(ALL_CART_ID);
      if (!exists) {
        await db.cart.add({
          id: ALL_CART_ID,
          items: [],
          subtotal: 0,
          taxTotal: 0,
          discountAmount: 0,
          totalAmount: 0,
          status: "active",
        });
      }
    };
    initCart();
  }, []);

  return { data: cart };
}

function mockMutation<TData, TVariables>(
  fn: (variables: TVariables) => Promise<TData>,
): UseMutationResult<TData, Error, TVariables, unknown> {
  return {
    mutate: (variables: TVariables, options?: any) => {
      fn(variables)
        .then((data) => options?.onSuccess?.(data, variables, undefined))
        .catch((err) => options?.onError?.(err, variables, undefined));
    },
    mutateAsync: fn,
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: "idle",
    reset: () => {},
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    variables: undefined,
  } as any;
}

export function useLocalCartOperations(): any {
  const calculateTotals = async () => {
    const items = await db.cartItems.where({ cartId: ALL_CART_ID }).toArray();
    let subtotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      taxTotal += lineTotal * (item.taxRate / 100);
    });

    const cart = await db.cart.get(ALL_CART_ID);
    const discount = cart?.discountAmount || 0;
    const totalAmount = subtotal + taxTotal - discount;

    await db.cart.update(ALL_CART_ID, {
      subtotal,
      taxTotal,
      totalAmount,
    });
  };

  return {
    addItem: mockMutation(
      async ({ product, cartId }: { product: any; cartId: any }) => {
        try {
          // Note: cartId is ignored, we use ALL_CART_ID
          const existingItem = await db.cartItems
            .where({ cartId: ALL_CART_ID, productId: product.id })
            .first();

          if (existingItem) {
            await db.cartItems.update(existingItem.id!, {
              quantity: existingItem.quantity + 1,
              updatedAt: new Date(),
            });
          } else {
            await db.cartItems.add({
              cartId: ALL_CART_ID,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              taxRate: product.tax_rate || 0,
              image_url: product.image_url,
              id: `item-${Date.now()}-${product.id}`, // Generate String ID
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          await calculateTotals();
          toast.success("Added to cart");
          // Return dummy cart state resembling CartState
          const cart = await db.cart.get(ALL_CART_ID);
          const items = await db.cartItems
            .where({ cartId: ALL_CART_ID })
            .toArray();
          return { ...cart, items } as any;
        } catch (e) {
          console.error(e);
          toast.error("Failed to add item");
          throw e;
        }
      },
    ),

    removeItem: mockMutation(
      async ({ itemId, cartId }: { itemId: any; cartId: any }) => {
        await db.cartItems.delete(itemId);
        await calculateTotals();
        const cart = await db.cart.get(ALL_CART_ID);
        return cart as any;
      },
    ),

    updateQuantity: mockMutation(
      async ({
        itemId,
        quantity,
        cartId,
      }: {
        itemId: any;
        quantity: number;
        cartId: any;
      }) => {
        if (quantity <= 0) {
          await db.cartItems.delete(itemId);
        } else {
          await db.cartItems.update(itemId, {
            quantity,
            updatedAt: new Date(),
          });
        }
        await calculateTotals();
        return {} as any;
      },
    ),

    clearCart: mockMutation(async ({ cartId }: { cartId: any }) => {
      await db.cartItems.where({ cartId: ALL_CART_ID }).delete();
      await db.cart.update(ALL_CART_ID, {
        subtotal: 0,
        taxTotal: 0,
        discountAmount: 0,
        totalAmount: 0,
        customerId: null,
        customerName: null,
        discountId: null,
      });
      return {} as any;
    }),

    setCustomer: mockMutation(
      async ({ customerId, customerName, cartId }: any) => {
        await db.cart.update(ALL_CART_ID, { customerId, customerName });
        return {} as any;
      },
    ),

    // Params are accepted but ignored
    applyDiscount: mockMutation(async (vars: any) => {
      console.warn("Apply discount local not implemented");
      return {} as any;
    }),
    removeDiscount: mockMutation(async (vars: any) => {
      console.warn("Remove discount local not implemented");
      return {} as any;
    }),
  };
}

export function useLocalCreateSale() {
  return mockMutation(
    async ({ newSale, items }: { newSale: any; items: any[] }) => {
      try {
        // Generate a temporary ID
        const tempId = `offline-${Date.now()}`;

        // Construct Offline Sale object
        const offlineSale = {
          tempId,
          customerId: newSale.customerId,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice, // number
            discountAmount: item.discountAmount,
            taxAmount: item.taxAmount,
            subtotal: item.subtotal,
          })),
          subtotal: newSale.subtotal,
          taxTotal: newSale.taxTotal,
          discountTotal: newSale.discountTotal,
          totalAmount: newSale.totalAmount,
          paymentMethod: newSale.paymentMethod,
          paymentStatus: newSale.paymentStatus,
          notes: newSale.notes,
          timestamp: Date.now(),
          synced: 0, // Not synced
          // Mock missing relations for InvoicePrint
          cashier: { name: "Offline Cashier" },
          branch: { name: "Offline Branch", address: "Local Address" },
          storeName: "Offline Store",
          logo: null,
        };

        await db.sales.add(offlineSale as any);
        // Trigger background sync if online?
        // For now just save locally.

        return offlineSale; // Return what was saved
      } catch (e) {
        console.error("Failed to create offline sale", e);
        throw e;
      }
    },
  );
}
