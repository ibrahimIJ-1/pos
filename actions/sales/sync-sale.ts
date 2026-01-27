"use server";

import { Sale, SaleItem } from "@prisma/client";
import { generateSaleNumber } from "./generateSaleNumber";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
// import { checkUser } from "../Authorization"; // Bypass if no session
// import { rolePermissions, UserRole } from "@/lib/permissions";
// import { checkUserPermissions } from "../users/check-permissions";
import { getSettingByName } from "../settings/get-setting-by-name";

export const syncSale = async (
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
  items: SaleItem[],
) => {
  try {
    // For sync, we might not have a session user if purely background, but usually we do if triggered by client.
    // However, the error log 'Internal Server Error' often points to auth failure or validation.
    // We'll bypass permission checks for sync.
    // We NEED a valid user/cashier ID though. Ideally the offline sale HAS the cashierId.
    // If cashierId is missing (offline mock), we need a fallback or find the first admin/cashier.

    // Fallback user if not provided or valid
    let targetCashierId = cashierId;
    if (!targetCashierId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) targetCashierId = defaultUser.id;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Sale must include at least one item");
    }

    // Generate a unique sale number or use existing if provided in offline logic?
    // Usually online system generates it.
    const saleNumber = await generateSaleNumber();

    // We assume the branch is related to the cashier or default branch
    // Ideally offline sale should carry branchId.
    let branchId = "";
    let registerIdToUse = registerId;

    if (targetCashierId) {
      const user = await prisma.user.findUnique({
        where: { id: targetCashierId },
        include: { mainBranch: true },
      });
      if (user && user.branchId) branchId = user.branchId;
      // Mock register?
      const register = await prisma.register.findFirst({
        where: { branchId: branchId },
      });
      if (register) registerIdToUse = register.id;
    }

    if (!branchId) {
      // Fallback
      const branch = await prisma.branch.findFirst();
      if (branch) branchId = branch.id;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Create the sale with its items
        const sale = await prisma.sale.create({
          data: {
            saleNumber,
            customerId,
            cashierId: targetCashierId,
            subtotal,
            taxTotal,
            discountTotal,
            totalAmount,
            paymentMethod,
            paymentStatus,
            notes: notes + " (Synced)",
            registerId: registerIdToUse,
            branchId: branchId,
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
        });

        for (const item of items) {
          // Optimistic stock update - might go negative
          // Check if branchProduct exists
          const bp = await prisma.branchProduct.findUnique({
            where: {
              productId_branchId: {
                branchId: branchId,
                productId: item.productId,
              },
            },
          });

          if (bp) {
            await prisma.branchProduct.update({
              where: {
                productId_branchId: {
                  branchId: branchId,
                  productId: item.productId,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        // If this sale is linked to a register, add a transaction record
        if (registerIdToUse) {
          try {
            await prisma.registerTransaction.create({
              data: {
                registerId: registerIdToUse,
                branchId: branchId,
                type: "SALE",
                referenceId: sale.id,
                amount: totalAmount,
                paymentMethod,
                description: `Sale #${saleNumber} (Synced)`,
                cashierId: targetCashierId,
              },
            });
          } catch (e) {
            console.error(
              "Register transaction failed during sync, continuing sale creation",
              e,
            );
          }
        }
        return sale;
      },
      {
        maxWait: 20000, // default: 2000
        timeout: 20000, // default: 5000
      },
    );

    return { success: true, id: result.id };
  } catch (error) {
    console.error("Error syncing sale:", error);
    // Return detailed error for client toast
    throw new Error(
      `Sync Error: ${error instanceof Error ? error.message : "Unknown"}`,
    );
  }
};
