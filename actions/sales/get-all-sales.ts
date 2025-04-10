"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const getAllSales = async ({
  page = 1,
  limit = 20,
  customerId,
}: {
  page?: number;
  limit?: number;
  customerId?: string;
}) => {
  try {
    await checkUserPermissions([...rolePermissions[UserRole.ACCOUNTANT]]);
    const pageNum = page;
    const limitNum = limit;
    const skip = (pageNum - 1) * limitNum;

    const where = customerId ? { customerId: customerId as string } : {};

    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    };
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Failed to fetch sales");
  }
};
