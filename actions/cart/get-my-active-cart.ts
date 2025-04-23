"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";
import { getRegisterById } from "../accounting/registers/get-register-by-id";
import { checkDiscountById } from "../discounts/check-discount";

export const getMyActiveUserCart = async (userId: string) => {
  // Try to fetch the active cart for this user
  const user = await checkUser();
  const reg = await getRegisterById(user.macAddress);
  if (!reg) throw new Error("Register Not found");
  const branchId = reg.branchId;
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      isActive: true,
      branchId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // If no cart exists, create and return a default one
  if (!cart) {
    const newCart = await prisma.cart.create({
      data: {
        userId,
        name: "Default Cart",
        isActive: true,
        branchId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      ...newCart,
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      totalAmount: 0,
    };
  }

  // Calculate subtotal and taxTotal in a single loop
  let subtotal = 0;
  let taxTotal = 0;
  cart.items.forEach((item) => {
    const price = Number(item.price);
    subtotal += price * item.quantity;
    taxTotal += (price * item.quantity * Number(item.taxRate)) / 100;
  });

  let discountTotal = 0;
  let discount = null;

  // Process discount if it exists on the cart
  if (cart.discountId && (await checkDiscountById(cart.discountId))) {
    const discountData = await prisma.discount.findUnique({
      where: { id: cart.discountId },
      include: { products: true },
    });

    if (discountData && subtotal >= Number(discountData.minPurchaseAmount)) {
      discount = {
        id: discountData.id,
        name: discountData.name,
        code: discountData.code,
        type: discountData.type.toLowerCase(),
        value: Number(discountData.value),
      };

      switch (discountData.type) {
        case "PERCENTAGE": {
          const rate = Number(discountData.value) / 100;
          if (discountData.appliesTo === "ENTIRE_ORDER") {
            discountTotal = subtotal * rate;
          } else if (discountData.appliesTo === "SPECIFIC_PRODUCTS") {
            cart.items.forEach((prod) => {
              if (discountData.products.some((p) => p.id === prod.productId)) {
                discountTotal += Number(prod.price) * prod.quantity * rate;
              }
            });
          } else if (discountData.appliesTo === "SPECIFIC_CATEGORIES") {
            cart.items.forEach((prod) => {
              if (
                discountData.categoryIds
                  ?.split(",")
                  .includes(prod.product.category)
              ) {
                discountTotal += Number(prod.price) * prod.quantity * rate;
              }
            });
          }
          break;
        }
        case "FIXED": {
          discountTotal = Math.min(subtotal, Number(discountData.value));
          break;
        }
        case "BUY_X_GET_Y": {
          if (!discountData.buyXQuantity || !discountData.getYQuantity) break;
          const productsIds = discountData.products.map((p) => p.id);
          const x = discountData.buyXQuantity;
          const y = discountData.getYQuantity;
          let boughtX = 0;
          cart.items.forEach((item) => {
            if (productsIds.includes(item.productId)) {
              boughtX += item.quantity;
            }
          });
          if (boughtX >= x) {
            const eligibleSets = Math.floor(boughtX / (x + y));
            const freeItemsCount = eligibleSets * y;
            // Filter eligible items and sort by price (cheapest first)
            const eligibleItems = cart.items
              .filter((item) => productsIds.includes(item.productId))
              .sort((a, b) => Number(a.price) - Number(b.price));
            let remainingFreeItems = freeItemsCount;
            for (const item of eligibleItems) {
              if (remainingFreeItems <= 0) break;
              const discountQuantity = Math.min(
                item.quantity,
                remainingFreeItems
              );
              discountTotal += discountQuantity * Number(item.price);
              remainingFreeItems -= discountQuantity;
            }
          }
          break;
        }
        default:
          discountTotal = 0;
          break;
      }
    } else {
      // If discount does not meet minPurchaseAmount or discount data is missing,
      // update the cart to remove the discount and proceed without it.
      await prisma.cart.update({
        where: { id: cart.id },
        data: { discountId: null },
      });
      cart.discountId = null;
    }
  }

  // Start fetching customer info concurrently (if exists)
  const customerPromise = cart.customerId
    ? prisma.customer.findUnique({ where: { id: cart.customerId } })
    : Promise.resolve(null);

  const customerData = await customerPromise;
  const customer = customerData
    ? { id: customerData.id, name: customerData.name }
    : null;

  const totalAmount = subtotal + taxTotal - discountTotal;

  return {
    id: cart.id,
    items: decimalToNumber(cart.items),
    customer,
    discount,
    subtotal,
    taxTotal,
    discountTotal,
    totalAmount,
    createdAt: cart.createdAt,
  };
};
