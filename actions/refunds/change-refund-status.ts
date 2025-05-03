"use server";

import { RefundStatus } from "@prisma/client";
import { checkUser } from "../Authorization";
import { checkUserPermissions } from "../users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const changeRefundStatus = async (
  refundId: string,
  status: RefundStatus
) => {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");
    if (!refundId) throw new Error("Provide Refund ID");

    if (status == RefundStatus.CANCELLED) {
      await checkUserPermissions([...rolePermissions[UserRole.CASHIER]]);
    } else if (status == RefundStatus.COMPLETED || status == RefundStatus.DECLINED) {
      await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);
    } else {      
      throw new Error("Status not found...");
    }
    const refund = await prisma.refund.update({
      where: {
        id: refundId,
      },
      data: {
        status: status,
      },
      include: {
        items: true,
        sale: {
          select: {
            saleNumber: true,
          },
        },
      },
    });

    if (status == "COMPLETED") {
      refund.items.forEach(async (item) => {
        await prisma.branchProduct.update({
          where: {
            productId_branchId: {
              branchId: refund.branchId,
              productId: item.productId,
            },
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      });

      await prisma.registerTransaction.create({
        data: {
          registerId: refund.registerId!,
          branchId: refund.branchId,
          type: "REFUND",
          referenceId: refund.id,
          amount: refund.totalAmount,
          paymentMethod: refund.paymentMethod,
          description: `Refund #${refund.sale.saleNumber}`,
          cashierId: refund.cashierId,
        },
      });
    }
    return [];
  } catch (error) {
    console.error("Error in changing the status:", error);
    throw new Error("Error in changing the status...");
  }
};
