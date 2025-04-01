import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createNewCustomer } from "@/actions/customers/create-customer";
import { getAllCustomers } from "@/actions/customers/get-all-customers";
import { updateCustomer } from "@/actions/customers/update-customer";
import { getAllProducts } from "@/actions/products/get-all-products";
import { createNewProduct } from "@/actions/products/create-product";
import {
  Discount,
  Product,
  RegisterTransaction,
  Sale,
  SaleItem,
} from "@prisma/client";
import { updateProduct } from "@/actions/products/update-product";
import { deleteProduct } from "@/actions/products/delete-product";
import { getAllDiscounts } from "@/actions/discounts/get-all-discounts";
import { getDiscountById } from "@/actions/discounts/get-discount-by-id";
import { createNewDiscount } from "@/actions/discounts/create-discount";
import { updateDiscount } from "@/actions/discounts/update-discount";
import { deleteDiscount } from "@/actions/discounts/delete-discount";
import { accountingSummary } from "@/actions/accounting/summery";
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
import { getAllSales } from "@/actions/sales/get-all-sales";
import { getSaleById } from "@/actions/sales/get-sale-by-id";
import { createNewSale } from "@/actions/sales/create-sale";
import { getCustomerById } from "@/actions/customers/get-customer-by-id";
import { getAllRegisters } from "@/actions/accounting/registers/get-all-registers";
import { openRegister } from "@/actions/accounting/registers/open-register";
import { closeRegister } from "@/actions/accounting/registers/close-register";
import { getAllRegisterTransactions } from "@/actions/accounting/transactions/get-all-register-transactions";
import { getRegisterTransactionById } from "@/actions/accounting/transactions/get-registere-transaction-by-id";
import { createRegisterTransaction } from "@/actions/accounting/transactions/create-register-transaction";
import { useAuth } from "@/contexts/AuthContext";
import { deleteRegister } from "@/actions/accounting/registers/delete-register";

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Product Services
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
};

// export const useProduct = (id: string) => {
//   return useQuery({
//     queryKey: ["products", id],
//     queryFn: async () => {
//       await delay(300);
//       const product = mockProducts.find((p) => p.id === id);
//       if (!product) throw new Error("Product not found");
//       return product;
//     },
//     enabled: !!id,
//   });
// };

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: any) => {
      const product: any = await createNewProduct(newProduct);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

// Customer Services
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getAllCustomers,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create customer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update customer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

// Sales Services
export const useSales = (page = 1, limit = 20, customerId?: string) => {
  return useQuery({
    queryKey: ["sales", page, limit, customerId],
    queryFn: () => getAllSales({ page, limit, customerId }),
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => getSaleById(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newSale, items }: { newSale: Sale; items: SaleItem[] }) =>
      createNewSale(newSale, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale completed successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to complete sale: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

// Register Services
export const useRegister = () => {
  return useQuery({
    queryKey: ["register"],
    queryFn: getAllRegisters,
  });
};

export const useDeleteRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useOpenRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; openingBalance: number }) =>
      openRegister(data.userId, data.openingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
      toast.success("Register opened successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to open register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useCloseRegister = () => {
  const queryClient = useQueryClient();
  //TODO: GET USER ID
  const auth = useAuth();
  const userId = auth.user?.id;
  return useMutation({
    mutationFn: async (data: { closingBalance: number }) =>
      closeRegister(userId!, data.closingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
      toast.success("Register closed successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to close register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

// Transaction Services
export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await getAllRegisterTransactions();
      return response;
    },
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: async () => {
      const response = (await getRegisterTransactionById(
        id
      )) as RegisterTransaction;
      return response;
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await createRegisterTransaction(transactionData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["registers"] });
    },
  });
};

// Accounting summary functions
export const useAccountingSummary = (period: "day" | "week" | "month") => {
  return useQuery({
    queryKey: ["accounting", "summary", period],
    queryFn: async () => {
      const response = await accountingSummary(period);

      return response;
    },
  });
};

// Discount Services
export const useDiscounts = () => {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: getAllDiscounts,
  });
};

export const useDiscount = (id: string) => {
  return useQuery({
    queryKey: ["discounts", id],
    queryFn: () => getDiscountById,
    enabled: !!id,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDiscount: any & { productIds: any }) => {
      const discount: any = await createNewDiscount(newDiscount);
      return discount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create discount: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discount: any & { productIds: any }) => {
      const updatedDiscount = await updateDiscount(discount);
      return updatedDiscount;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discounts", data.id] });
      toast.success("Discount updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update discount: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete discount: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useRegisters = () => {
  return useQuery({
    queryKey: ["registers"],
    queryFn: getAllRegisters,
  });
};

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

// Helper functions for cart calculations with discount support
// const calculateCartTotals = (
//   items: CartItem[],
//   appliedDiscount?: Discount
// ): {
//   subtotal: number;
//   taxTotal: number;
//   discountAmount: number;
//   total: number;
// } => {
//   const subtotal = items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const taxTotal = items.reduce(
//     (sum, item) => sum + item.price * item.quantity * item.taxRate,
//     0
//   );

//   let discountAmount = 0;

//   if (appliedDiscount && appliedDiscount.isActive) {
//     const now = new Date();
//     const startDate = new Date(appliedDiscount.startDate);
//     const endDate = appliedDiscount.endDate
//       ? new Date(appliedDiscount.endDate)
//       : null;

//     if (now >= startDate && (!endDate || now <= endDate)) {
//       if (
//         appliedDiscount.type === DiscountType.PERCENTAGE &&
//         appliedDiscount.appliesTo === DiscountAppliesTo.ENTIRE_ORDER
//       ) {
//         discountAmount = subtotal * (appliedDiscount.value.toNumber() / 100);
//       } else if (
//         appliedDiscount.type === DiscountType.FIXED &&
//         appliedDiscount.appliesTo === DiscountAppliesTo.ENTIRE_ORDER
//       ) {
//         discountAmount = Math.min(subtotal, appliedDiscount.value.toNumber());
//       } else if (
//         appliedDiscount.appliesTo === DiscountAppliesTo.SPECIFIC_PRODUCTS &&
//         appliedDiscount.products.length
//       ) {
//         if (
//           appliedDiscount.type === DiscountType.BUY_X_GET_Y &&
//           appliedDiscount.buyXQuantity &&
//           appliedDiscount.getYQuantity
//         ) {
//           // For each product ID in the discount
//           for (const productId of appliedDiscount.product_ids) {
//             const item = items.find((item) => item.productId === productId);
//             if (item) {
//               const eligibleSets = Math.floor(
//                 item.quantity /
//                   (appliedDiscount.buyXQuantity! +
//                     appliedDiscount.getYQuantity!)
//               );
//               const discountedItems =
//                 eligibleSets * appliedDiscount.getYQuantity!;
//               discountAmount +=
//                 discountedItems * item.price * (appliedDiscount.value.toNumber() / 100);
//             }
//           }
//         } else {
//           // For percentage or fixed discounts on specific products
//           items.forEach((item) => {
//             if (appliedDiscount..includes(item.productId)) {
//               if (appliedDiscount.type === DiscountType.PERCENTAGE) {
//                 discountAmount +=
//                   item.price * item.quantity * (appliedDiscount.value.toNumber() / 100);
//               } else if (appliedDiscount.type === DiscountType.FIXED) {
//                 discountAmount += Math.min(
//                   item.price * item.quantity,
//                   appliedDiscount.value.toNumber()
//                 );
//               }
//             }
//           });
//         }
//       } else if (
//         appliedDiscount.appliesTo === DiscountAppliesTo.SPECIFIC_CATEGORIES &&
//         appliedDiscount.categoryIds?.length
//       ) {
//         // For category-based discounts (simplified, since we don't track category in cart items)
//         // In a real app, you'd probably need to look up the product's category
//         discountAmount = subtotal * (appliedDiscount.value.toNumber() / 100);
//       }
//     }
//   }

//   // Ensure discount doesn't exceed subtotal
//   discountAmount = Math.min(discountAmount, subtotal);

//   const total = subtotal + taxTotal - discountAmount;

//   return {
//     subtotal,
//     taxTotal,
//     discountAmount,
//     total,
//   };
// };

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
      // onMutate: async ({ product, cartId }) => {
      //   await queryClient.cancelQueries({ queryKey: ["cart"] });

      //   const previousCart = queryClient.getQueryData(["cart"]);
      //   console.log(previousCart);

      //   queryClient.setQueryData(["cart"], (oldCart: any) => {
      //     if (!oldCart) return { items: [] }; // Handle null case

      //     // Check if product already exists
      //     const existingItem = (oldCart.items as any[]).findIndex(
      //       (item: any) => item.productId === product.id
      //     );

      //     if (existingItem != -1) {
      //       // Increment quantity if exists
      //       oldCart.items[existingItem].quantity++;
      //       return oldCart;
      //     } else {
      //       // Add new item if not exists
      //       oldCart.items.push({
      //         id: `temp-${Math.random() * Math.random() * 100}`,
      //         ...product,
      //         quantity: 1,
      //         cartId: oldCart.id,
      //       });
      //       return oldCart;
      //     }
      //   });

      //   return { previousCart };
      // },
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
      // onMutate: async ({ itemId }) => {
      //   await queryClient.cancelQueries({ queryKey: ["cart"] });

      //   const previousCart = queryClient.getQueryData(["cart"]);

      //   queryClient.setQueryData(["cart"], (oldCart: any) => {
      //     const old = oldCart.items.filter(
      //       (item: any) => item.productId !== itemId
      //     );
      //     return old;
      //   });

      //   return { previousCart };
      // },
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
