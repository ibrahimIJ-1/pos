"use server";

import { Sale, SaleItem } from "@prisma/client";
import { generateSaleNumber } from "./generateSaleNumber";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { checkUser } from "../Authorization";

export const createNewSale = async (
  {
    customerId,
    subtotal,
    taxTotal,
    discountTotal,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
    registerId,
    cashierId,
  }: Sale,
  items: SaleItem[]
) => {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Sale must include at least one item");
    }

    // Generate a unique sale number
    const saleNumber = await generateSaleNumber();
    const user = await checkUser();
    
    if (!user) throw new Error("user not found");
    // Create the sale with its items
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        customerId,
        cashierId: user.id,
        subtotal,
        taxTotal,
        discountTotal,
        totalAmount,
        paymentMethod,
        paymentStatus,
        notes,
        registerId: user.macAddress,
        items: {
          create: items.map((item: SaleItem) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            taxAmount: item.taxAmount || 0,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        customer: true,
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    items.forEach((item) => {
      prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    });

    // If this sale is linked to a register, add a transaction record
    if (user.macAddress) {
      await prisma.registerTransaction.create({
        data: {
          registerId:user.macAddress,
          type: "SALE",
          referenceId: sale.id,
          amount: totalAmount,
          paymentMethod,
          description: `Sale #${saleNumber}`,
          //TODO GET THE CASHIER ID
          cashierId:user.id,
        },
      });
    }

    return decimalToNumber(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    throw new Error("Failed to create sale");
  }
};
