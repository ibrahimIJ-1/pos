"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import { getSettingByName } from "../settings/get-setting-by-name";
import { decimalToNumber } from "@/lib/utils";

export const checkRefund = async (saleNumber: string) => {
  try {
    const user = await checkUser();
    if (!user) throw new Error("user not found");
    const register = await prisma.register.findUnique({
      where: {
        id: user.macAddress,
        currentCashierId: user.id,
      },
      include: {
        branch: true,
      },
    });

    if (!register) throw new Error("register not found");
    if (!saleNumber) throw new Error("Provide Sale Number!");
    const refundDaysSetting = await getSettingByName("refundDays");
    const refundDays = Number(refundDaysSetting.value);

    if (isNaN(refundDays)) {
      throw new Error(`Invalid refundDays setting: ${refundDaysSetting}`);
    }
    const refundLimitDate = new Date();
    refundLimitDate.setDate(refundLimitDate.getDate() - refundDays);

    if (isNaN(refundLimitDate.getTime())) {
      throw new Error(
        `Computed refundLimitDate is invalid: ${refundLimitDate}`
      );
    }
    refundLimitDate.setDate(refundLimitDate.getDate() - refundDays);
    const sale = await prisma.sale.findFirst({
      where: {
        saleNumber: saleNumber,
        branchId: register.branchId,
        created_at: {
          gte: refundLimitDate.toISOString(),
        },
      },
      include: {
        items: true,
        cashier: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!sale)
      throw new Error(
        `Check the Sale Number ${saleNumber}, Branch ${
          register.branch.name
        }, or date should not be older than ${refundLimitDate.toLocaleDateString()}...`
      );
    return decimalToNumber(sale);
  } catch (error:any) {
    throw error;
  }
};
