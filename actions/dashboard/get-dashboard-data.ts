"use server";

import { prisma } from "@/lib/prisma";
import { DashboardData } from "@/lib/types/dashboard";

type DateRange = "last7" | "last30" | "last90" | "last365" | "all";

export async function getDashboardData(
  dateRange: DateRange = "last30"
): Promise<DashboardData> {
  // Fixed date calculation (prevents mutation of original date)
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case "last7":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last30":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "last90":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "last365":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0); // Unix epoch start
      break;
  }

  // Fetch all data in parallel
  const [
    totalRevenueResult,
    salesCount,
    activeCustomers,
    productsLowStock,
    monthlyRevenueRaw,
    salesByCategoryRaw,
    paymentMethodsRaw,
    recentTransactions,
  ] = await Promise.all([
    // Total Revenue (filtered by date range)
    prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        created_at: {
          gte: startDate,
        },
      },
    }),

    // Sales Count (filtered by date range)
    prisma.sale.count({
      where: {
        created_at: {
          gte: startDate,
        },
      },
    }),

    // Active Customers (who made purchases in date range)
    prisma.customer.count({
      where: {
        sales: {
          some: {
            created_at: {
              gte: startDate,
            },
          },
        },
      },
    }),

    // FIXED: Low Stock Items (now using BranchProduct)
    prisma.branchProduct.count({
      where: {
        stock: {
          lt: prisma.branchProduct.fields.low_stock_threshold,
        },
      },
    }),

    // Monthly Revenue (filtered by date range)
    prisma.$queryRaw<{ month: string; revenue: number }[]>`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_amount) as revenue
      FROM sales
      WHERE created_at >= ${startDate}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `,

    // Sales by Category (filtered by date range)
    prisma.$queryRaw<{ id: string; value: number }[]>`
      SELECT 
        p.category as id,
        SUM(si.subtotal) as value
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= ${startDate}
      GROUP BY p.category
    `,

    // Payment Methods (filtered by date range)
    prisma.$queryRaw<{ id: string; value: number }[]>`
      SELECT 
        payment_method as id,
        SUM(total_amount) as value
      FROM sales
      WHERE created_at >= ${startDate}
      GROUP BY payment_method
    `,

    // Recent Transactions (last 5 regardless of range)
    prisma.registerTransaction.findMany({
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        amount: true,
        type: true,
        paymentMethod: true,
        created_at: true,
      },
    }),
  ]);

  // Transform raw SQL results to match expected types
  const monthlyRevenue = monthlyRevenueRaw.map((item) => ({
    month: item.month,
    revenue: Number(item.revenue),
  }));

  const salesByCategory = salesByCategoryRaw.map((item) => ({
    id: item.id,
    value: Number(item.value),
  }));

  const paymentMethods = paymentMethodsRaw.map((item) => ({
    id: item.id,
    value: Number(item.value),
  }));

  return {
    totalRevenue: Number(totalRevenueResult._sum.totalAmount) || 0,
    salesCount,
    activeCustomers,
    productsLowStock,
    monthlyRevenue,
    salesByCategory,
    paymentMethods,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      paymentMethod: tx.paymentMethod,
      createdAt: tx.created_at,
    })),
  };
}
