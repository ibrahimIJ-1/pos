"use server";

import { Refund, RefundItem, RefundStatus } from "@prisma/client";
import { checkUserPermissions } from "../users/check-permissions";
import { checkUser } from "../Authorization";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSettingByName } from "../settings/get-setting-by-name";
import { decimalToNumber } from "@/lib/utils";

interface ICreateRefund {
  refund: Partial<Refund>;
  refundItems: RefundItem[];
}
export const createRefund = async ({ refund, refundItems }: ICreateRefund) => {
  try {
    const user = await checkUser();
    if (!user) throw new Error("user not found");
    await checkUserPermissions([...rolePermissions[UserRole.CASHIER]]);

    if (
      !refundItems ||
      !Array.isArray(refundItems) ||
      refundItems.length === 0
    ) {
      throw new Error("Refund must include at least one item");
    }

    const register = await prisma.register.findUnique({
      where: {
        id: user.macAddress,
        currentCashierId: user.id,
      },
    });

    if (!register) {
      throw new Error("register not found");
    }

    const savedRefund = await prisma.refund.create({
      data: {
        saleId: refund.saleId!,
        customerId: refund.customerId ?? null,
        cashierId: user.id,
        subtotal: refund.subtotal!,
        taxTotal: refund.taxTotal!,
        discountTotal: refund.discountTotal!,
        totalAmount: refund.totalAmount!,
        paymentMethod: "cash",
        paymentStatus: "",
        notes: refund.notes ?? "",
        reason: refund.reason ?? "",
        status: RefundStatus.PENDING,
        registerId: register.id,
        branchId: register.branchId,
        items: {
          create: refundItems.map((item: RefundItem) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            taxAmount: item.taxAmount || 0,
            subtotal: item.subtotal,
            saleItemId: item.saleItemId,
          })),
        },
      },
      include: {
        customer: true,
        sale: true,
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                BranchProduct: {
                  where: {
                    branchId: register.branchId,
                  },
                },
              },
            },
          },
        },
      },
    });
    refundItems.forEach(async (element: RefundItem) => {
      await prisma.saleItem.update({
        where: {
          id: element.saleItemId,
        },
        data: {
          refundedQuantity: {
            increment: element.quantity,
          },
        },
      });
    });

    const storeName = await getSettingByName("storeName");
    return {
      ...(decimalToNumber(savedRefund) as Object),
      storeName: storeName ? storeName.value ?? "Flash Pro" : "Flash Pro",
    };
  } catch (error) {
    console.error("Error creating refund:", error);
    throw new Error("Failed to create refund");
  }
};
