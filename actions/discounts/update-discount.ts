"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { BranchProduct, Discount } from "@prisma/client";
import { checkUserPermissions } from "../users/check-permissions";
import { decimalToNumber } from "@/lib/utils";
import { getAllUserBranches } from "../branches/get-user-all-branches";

export const updateDiscount = async ({
  id,
  name,
  code,
  type,
  value,
  minPurchaseAmount,
  appliesTo,
  productIds,
  categoryIds,
  buyXQuantity,
  getYQuantity,
  startDate,
  endDate,
  maxUses,
  isActive,
  branches,
}: Partial<Discount & { productIds?: string[] } & { branches?: string[] }>) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.ACCOUNTANT]]);
    // Validate required fields
    if (!name || !type || value === undefined || !appliesTo || !startDate) {
      throw new Error("Missing required discount fields");
    }
    const currentBranchIds =
      (
        await prisma.discount.findUnique({
          where: { id },
          select: { branches: { select: { id: true } } },
        })
      )?.branches.map((b) => b.id) || [];

    const userBranches = (await getAllUserBranches()).branches.map((b) => b.id);
    const submittedBranchIds = (branches || []).filter((id) =>
      userBranches.includes(id)
    );

    const toConnect = submittedBranchIds.filter(
      (id) => !currentBranchIds.includes(id)
    );
    const toDisconnect = userBranches.filter(
      (id) => !submittedBranchIds.includes(id) && currentBranchIds.includes(id)
    );

    // Update the discount
    const discount = await prisma.discount.update({
      where: { id },
      data: {
        name,
        code,
        type,
        value: value,
        minPurchaseAmount: minPurchaseAmount ? minPurchaseAmount : null,
        appliesTo,
        categoryIds: categoryIds || null,
        buyXQuantity: buyXQuantity ? buyXQuantity : null,
        getYQuantity: getYQuantity ? getYQuantity : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxUses: maxUses ? maxUses : null,
        isActive: isActive !== undefined ? isActive : true,
        products: {
          set: [], // First disconnect all products
          connect:
            productIds && productIds.length > 0
              ? productIds.map((id: string) => ({ id }))
              : undefined,
        },
        branches: {
          connect: toConnect.map((id) => ({ id })),
          disconnect: toDisconnect.map((id) => ({ id })),
        },
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return decimalToNumber(discount);
  } catch (error) {
    console.error(`Error updating discount ${id}:`, error);
    throw new Error("Failed to update discount");
  }
};
