"use server";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";

export const getActiveUserCart = async () => {
  try {
    const userId = (await checkUser()).id;
    // Get the active cart for this user
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If no cart exists, create a default one
    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          userId,
          name: "Default Cart",
          isActive: true,
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

    // Calculate totals
    const subtotal = cart.items.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );

    const taxTotal = cart.items.reduce(
      (total, item) =>
        total +
        (Number(item.price) * item.quantity * Number(item.taxRate)) / 100,
      0
    );

    let discountTotal = 0;
    let discount = null;

    if (cart.discountId) {
      // Get discount details
      const discountData = await prisma.discount.findUnique({
        where: { id: cart.discountId },
        include: {
          products: true,
        },
      });

      if (discountData) {
        if (subtotal >= Number(discountData?.minPurchaseAmount)) {
          discount = {
            id: discountData.id,
            name: discountData.name,
            code: discountData.code,
            type: discountData.type.toLowerCase(),
            value: Number(discountData.value),
          };
          switch (discountData.type) {
            case "PERCENTAGE":
              if (discountData.appliesTo == "ENTIRE_ORDER")
                discountTotal = subtotal * (Number(discountData.value) / 100);
              else if (discountData.appliesTo == "SPECIFIC_PRODUCTS") {
                cart.items.forEach((prod) => {
                  if (
                    discountData.products.find(
                      (p) => p.id == prod.productId
                    ) !== undefined
                  ) {
                    discountTotal +=
                      Number(prod.price) *
                      prod.quantity *
                      (Number(discountData.value) / 100);
                  }
                });
              } else if (discountData.appliesTo == "SPECIFIC_CATEGORIES") {
                cart.items.forEach((prod) => {
                  if (
                    discountData.categoryIds
                      ?.split(",")
                      ?.find((p) => p == prod.product.category) !== undefined
                  ) {
                    discountTotal +=
                      Number(prod.price) *
                      prod.quantity *
                      (Number(discountData.value) / 100);
                  }
                });
              }
              break;
            case "FIXED":
              discountTotal = Math.min(subtotal, Number(discountData.value));
              break;
            case "BUY_X_GET_Y":
              if (!discountData.buyXQuantity || !discountData.getYQuantity) {
                discountTotal = 0;
                break;
              }
              const productsIds = discountData.products.map((p) => p.id);
              const x = discountData.buyXQuantity;
              const y = discountData.getYQuantity;
              let boughtX = 0;
              if (productsIds.length > 0) {
                cart.items.forEach((item) => {
                  if (productsIds.includes(item.productId)) {
                    boughtX += item.quantity;
                  }
                });
              }

              if (boughtX >= x) {
                // Calculate how many full sets (Buy X) the user purchased
                const eligibleSets = Math.floor(boughtX / (x + y)); // Ensures extra items beyond the rule do not get free
                const freeItemsCount = eligibleSets * y; // Total free items user gets

                // Sort items by price (cheapest first) to apply the discount efficiently
                const eligibleItems = cart.items
                  .filter((item) => productsIds.includes(item.productId))
                  .sort((a, b) => a.price.toNumber() - b.price.toNumber());

                let remainingFreeItems = freeItemsCount;

                for (const item of eligibleItems) {
                  if (remainingFreeItems <= 0) break;
                  const discountQuantity = Math.min(
                    item.quantity,
                    remainingFreeItems
                  );
                  discountTotal += discountQuantity * item.price.toNumber();
                  remainingFreeItems -= discountQuantity;
                }
              }

              break;
            default:
              discountTotal = 0;
              break;
          }
        } else {
          await prisma.cart.update({
            where: {
              id: cart.id,
              userId,
              isActive: true,
            },
            data: {
              discountId: null,
            },
          });
          cart = await prisma.cart.findFirst({
            where: {
              userId,
              isActive: true,
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          });
          if (!cart) throw new Error("Error happened...");
        }
      }
    }

    // Get customer info if a customer is attached
    let customer = null;
    if (cart.customerId) {
      const customerData = await prisma.customer.findUnique({
        where: { id: cart.customerId },
      });

      if (customerData) {
        customer = {
          id: customerData.id,
          name: customerData.name,
        };
      }
    }

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
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
};
