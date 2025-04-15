"use server"

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

interface CustomerReportParams {
  from: string;
  to: string;
}

interface CustomerReportData {
  totalCustomers: number;
  newCustomers: number;
  averagePurchaseValue: number;
  customerRetentionRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    purchaseCount: number;
    totalSpend: number;
    averageOrderValue: number;
    lastPurchaseDate: Date | null;
  }>;
  customerPurchasesByLocation: Array<{
    region: string | null;
    customerCount: number;
    orderCount: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

export const getCustomerReport = async ({
  from,
  to,
}: CustomerReportParams): Promise<CustomerReportData> => {
  try {
    const user = await checkUser();
    const branch = await prisma.user.findUnique({
      where: { id: user.id },
      select: { branchId: true },
    });

    if (!branch?.branchId) throw new Error("No branch found");
    const branchId = branch.branchId;

    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setDate(endDate.getDate() + 1); // Include end date

    // 1. Total Unique Customers
    const totalCustomersResult = await prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        branchId,
        created_at: { gte: startDate, lt: endDate },
        customerId: { not: null },
      },
    });
    const totalCustomers = totalCustomersResult.length;

    // 2. New Customers
    const newCustomers = await prisma.customer.count({
      where: {
        sales: {
          some: {
            branchId,
            created_at: { gte: startDate, lt: endDate },
          },
        },
        NOT: {
          sales: {
            some: {
              branchId,
              created_at: { lt: startDate },
            },
          },
        },
      },
    });

    // 3. Average Purchase Value
    const totalRevenueResult = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { branchId, created_at: { gte: startDate, lt: endDate } },
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount?.toNumber() || 0;

    const totalOrdersResult = await prisma.sale.count({
      where: { branchId, created_at: { gte: startDate, lt: endDate } },
    });
    const averagePurchaseValue =
      totalOrdersResult > 0 ? totalRevenue / totalOrdersResult : 0;

    // 4. Customer Retention Rate
    const [customersActiveBefore, customersActiveDuring] = await Promise.all([
      prisma.sale.groupBy({
        by: ["customerId"],
        where: {
          branchId,
          created_at: { lt: startDate },
          customerId: { not: null },
        },
      }),
      prisma.sale.groupBy({
        by: ["customerId"],
        where: {
          branchId,
          created_at: { gte: startDate, lt: endDate },
          customerId: { not: null },
        },
      }),
    ]);

    const retainedCustomers = customersActiveBefore.filter((c) =>
      customersActiveDuring.some((d) => d.customerId === c.customerId)
    ).length;

    const customerRetentionRate =
      customersActiveBefore.length > 0
        ? (retainedCustomers / customersActiveBefore.length) * 100
        : 0;

    // 5. Top Customers
    const topCustomersResult = await prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        branchId,
        created_at: { gte: startDate, lt: endDate },
        customerId: { not: null },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 10,
    });

    const topCustomers = await Promise.all(
      topCustomersResult.map(async (result) => {
        const [customer, lastSale] = await Promise.all([
          prisma.customer.findUnique({
            where: { id: result.customerId! },
          }),
          prisma.sale.findFirst({
            where: {
              branchId,
              customerId: result.customerId!,
              created_at: { gte: startDate, lt: endDate },
            },
            orderBy: { created_at: "desc" },
            select: { created_at: true },
          }),
        ]);

        return {
          id: result.customerId!,
          name: customer?.name || "Unknown",
          purchaseCount: result._count.id,
          totalSpend: result._sum.totalAmount?.toNumber() || 0,
          averageOrderValue:
            result._count.id > 0
              ? (result._sum.totalAmount?.toNumber() || 0) / result._count.id
              : 0,
          lastPurchaseDate: lastSale?.created_at || null,
        };
      })
    );

    // 6. Corrected Customer Purchases by Location
    const cities = await prisma.customer.findMany({
      where: {
        sales: {
          some: {
            branchId,
            created_at: { gte: startDate, lt: endDate },
          },
        },
        city: { not: null },
      },
      distinct: ["city"],
      select: { city: true },
    });

    const customerPurchasesByLocation = await Promise.all(
      cities.map(async ({ city }) => {
        const [salesAggregate, customerCount] = await Promise.all([
          prisma.sale.aggregate({
            where: {
              branchId,
              created_at: { gte: startDate, lt: endDate },
              customer: { city },
            },
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          prisma.customer.count({
            where: {
              city,
              sales: {
                some: {
                  branchId,
                  created_at: { gte: startDate, lt: endDate },
                },
              },
            },
          }),
        ]);

        return {
          region: city,
          customerCount,
          orderCount: salesAggregate._count.id,
          revenue: salesAggregate._sum.totalAmount?.toNumber() || 0,
          averageOrderValue:
            salesAggregate._count.id > 0
              ? (salesAggregate._sum.totalAmount?.toNumber() || 0) /
                salesAggregate._count.id
              : 0,
        };
      })
    );

    const reportData: CustomerReportData = {
      totalCustomers,
      newCustomers,
      averagePurchaseValue,
      customerRetentionRate,
      topCustomers,
      customerPurchasesByLocation,
    };

    return reportData;
  } catch (error: any) {
    console.error("Error generating customer report:", error);
    throw new Error("Failed to generate customer report");
  } finally {
    await prisma.$disconnect();
  }
};
