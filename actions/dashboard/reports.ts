"use server";

import { prisma } from "@/lib/prisma";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { checkUser } from "../Authorization";

export const getPageReports = async () => {
  const user = await checkUser();
  const branch = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      branchId: true,
    },
  });
  if (!branch || !branch?.branchId) throw new Error("No branch Found");
  const mainBranchId = branch?.branchId;
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Total Revenue
  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        branchId: mainBranchId,
        created_at: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        branchId: mainBranchId,
        created_at: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
  ]);

  // Average Order
  const [currentOrders, previousOrders] = await Promise.all([
    prisma.sale.aggregate({
      _avg: { totalAmount: true },
      where: {
        branchId: mainBranchId,
        created_at: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }),
    prisma.sale.aggregate({
      _avg: { totalAmount: true },
      where: {
        branchId: mainBranchId,
        created_at: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
  ]);

  // Low Stock
  const lowStockProducts = await prisma.branchProduct.findMany({
    where: {
      branchId: mainBranchId,
      stock: { lt: prisma.branchProduct.fields.low_stock_threshold },
    },
  });

  // Customer Growth
  const [currentCustomers, previousCustomers] = await Promise.all([
    prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        branchId: mainBranchId,
        created_at: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }),
    prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        branchId: mainBranchId,
        created_at: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
  ]);

  return {
    totalRevenue: Number(currentRevenue._sum.totalAmount || 0),
    revenueChangePercent: calculatePercentageChange(
      Number(previousRevenue._sum.totalAmount),
      Number(currentRevenue._sum.totalAmount)
    ),
    averageOrder: Number(currentOrders._avg.totalAmount || 0),
    averageOrderChange: calculatePercentageChange(
      Number(previousOrders._avg.totalAmount),
      Number(currentOrders._avg.totalAmount)
    ),
    lowStockCount: lowStockProducts.length,
    criticalStockCount: lowStockProducts.filter(
      (p) => p.stock < p.low_stock_threshold * 0.2
    ).length,
    newCustomers: currentCustomers.length - previousCustomers.length,
  };
};

// Helper function
function calculatePercentageChange(previous: number, current: number) {
  if (!previous) return 100;
  return (((current - previous) / previous) * 100).toFixed(1);
}
