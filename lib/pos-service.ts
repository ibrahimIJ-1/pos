import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCart } from "@/actions/cart/multicart/create-cart";
import { setActiveCart } from "@/actions/cart/multicart/set-active-cart";
import { deleteCurrentCart } from "@/actions/cart/multicart/delete-current-cart";
import { duplicateCart } from "@/actions/cart/multicart/duplicate-cart";
import { getAllUserCarts } from "@/actions/cart/multicart/get-all-user-carts";
import { addCartItem } from "@/actions/cart/add-cart-item";
import { deleteCartItem } from "@/actions/cart/delete-cart-item";
import { updateCartItemQuantity } from "@/actions/cart/update-cart-item-quantity";
import { deleteCart } from "@/actions/cart/delete-cart";
import { updateCustomerCart } from "@/actions/cart/update-customer-cart";
import { updateCartDiscount } from "@/actions/cart/update-cart-discount";
import { deleteCartDiscount } from "@/actions/cart/delete-cart-discount";
import { getActiveUserCart } from "@/actions/cart/get-active-user-cart";

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// Cart service interfaces
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
}

export interface CartState {
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  appliedDiscountId?: string;
  appliedDiscountName?: string;
  discountAmount: number;
  subtotal: number;
  taxTotal: number;
  total: number;
}

export interface MultiCartState {
  carts: Record<string, CartState>;
  activeCartId: string;
}

const createEmptyCart = (): CartState => {
  return {
    items: [],
    subtotal: 0,
    taxTotal: 0,
    discountAmount: 0,
    total: 0,
  };
};

const generateCartId = (): string => {
  return `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => await getActiveUserCart(),
    staleTime: 1000 * 60 * 5, // Cache cart for 5 minutes
    refetchOnWindowFocus: false, // Avoid unnecessary refetching
    refetchOnReconnect: "always", // Fetch only if the connection is lost & restored
  });
}

// useCartOperations hook

export function useCartOperations() {
  const queryClient = useQueryClient();

  return {
    addItem: useMutation({
      mutationFn: async ({
        product,
        cartId,
      }: {
        product: any;
        cartId: string;
      }) => {
        return addCartItem({
          cartId,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          taxRate: product.tax_rate || 0,
        });
      },
      onSuccess: (data, { product }) => {
        queryClient.setQueryData(["cart"], data);
      },
      onError: (_error, _variables, context) => {
        // queryClient.setQueryData(["cart"], context?.previousCart);
      },
    }),

    removeItem: useMutation({
      mutationFn: async ({
        itemId,
        cartId,
      }: {
        itemId: string;
        cartId: string;
      }) => {
        return deleteCartItem(cartId, itemId);
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["cart"], data);
      },
      onError: (_error, _variables, context) => {
        // queryClient.setQueryData(["cart"], context?.previousCart);
      },
    }),

    updateQuantity: useMutation({
      mutationFn: async ({
        itemId,
        quantity,
        cartId,
      }: {
        itemId: string;
        quantity: number;
        cartId: string;
      }) => {
        return updateCartItemQuantity(cartId, itemId, quantity);
      },
      onMutate: async ({ itemId, quantity }) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });

        const previousCart = queryClient.getQueryData(["cart"]);

        queryClient.setQueryData(["cart"], (oldCart: any) => {
          if (!oldCart) return { items: [] };
          if (quantity <= 0) {
            return {
              ...oldCart,
              items: oldCart.items.filter((item: any) => item.id !== itemId),
            };
          } else {
            return {
              ...oldCart,
              items: oldCart.items.map((item: any) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
            };
          }
        });

        return { previousCart };
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["cart"], data);
      },
      onError: (_error, _variables, context) => {
        queryClient.setQueryData(["cart"], context?.previousCart);
      },
    }),
    clearCart: useMutation({
      mutationFn: async ({ cartId }: { cartId: string }) => {
        const response = await deleteCart(cartId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),
    // Adding methods for the POS component

    setCustomer: useMutation({
      mutationFn: async ({
        customerId,
        customerName,
        cartId,
      }: {
        customerId?: string;
        customerName?: string;
        cartId: string;
      }) => {
        const response = await updateCustomerCart(
          cartId,
          customerId,
          customerName
        );
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),

    applyDiscount: useMutation({
      mutationFn: async ({
        discountId,
        cartId,
      }: {
        discountId: string;
        cartId: string;
      }) => {
        const response = await updateCartDiscount(cartId, discountId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),
    removeDiscount: useMutation({
      mutationFn: async (cartId: string) => {
        const response = await deleteCartDiscount(cartId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),
  };
}

// useMultiCart hook
export const useMultiCart = () => {
  return useQuery({
    queryKey: ["multicart"],
    queryFn: async () => {
      const response = await getAllUserCarts();
      return response;
    },
  });
};

export function useMultiCartOperations() {
  const queryClient = useQueryClient();

  return {
    addCart: useMutation({
      mutationFn: async () => {
        const response = await createCart();
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["multicart"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),

    switchCart: useMutation({
      mutationFn: async (cartId: string) => {
        const response = await setActiveCart(cartId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["multicart"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),

    removeCart: useMutation({
      mutationFn: async (cartId: string) => {
        const response = await deleteCurrentCart(cartId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["multicart"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),
    duplicateCart: useMutation({
      mutationFn: async (cartId: string) => {
        const response = await duplicateCart(cartId);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["multicart"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    }),
  };
}
