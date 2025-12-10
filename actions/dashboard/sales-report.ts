"use server";

import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { checkUser } from "../Authorization";
import { Prisma } from "@prisma/client";
import { decimalToNumber } from "@/lib/utils";

// ... (keep SalesReportData type definition the same)

export async function getSalesReport(fromDate: Date, toDate: Date) {
  try {
    const user = await checkUser();
    const branch = await prisma.user.findUnique({
      where: { id: user.id },
      select: { branchId: true },
    });

    if (!branch?.branchId) throw new Error("No branch found");
    const branchId = branch.branchId;

    // Calculate previous period dates
    const currentPeriodDays = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousFromDate = subDays(fromDate, currentPeriodDays);
    const previousToDate = subDays(toDate, currentPeriodDays);

    // Base query conditions
    const baseConditions: Prisma.SaleWhereInput = {
      branchId,
      created_at: { gte: fromDate, lte: toDate },
    };

    // Execute all queries in parallel
    const [
      currentSales,
      previousSales,
      paymentMethods,
      currentCategories,
      previousCategories,
      products,
      hourly,
      employees,
    ] = await Promise.all([
      // Current period sales
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: baseConditions,
      }),

      // Previous period sales
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: {
          branchId,
          created_at: { gte: previousFromDate, lte: previousToDate },
        },
      }),

      // Sales by payment method
      prisma.sale.groupBy({
        by: ["paymentMethod"],
        _sum: { totalAmount: true },
        _count: true,
        where: baseConditions,
      }),

      // Current period categories
      prisma.$queryRaw<Array<{ category: string; sales: number }>>`
        SELECT
          p.category,
          SUM(si.subtotal) as sales
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.branch_id = ${branchId}
          AND s.created_at BETWEEN ${fromDate} AND ${toDate}
        GROUP BY p.category
      `,
      // Previous period categories
      prisma.$queryRaw<Array<{ category: string; sales: number }>>`
        SELECT
          p.category,
          SUM(si.subtotal) as sales
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.branch_id = ${branchId}
          AND s.created_at BETWEEN ${previousFromDate} AND ${previousToDate}
        GROUP BY p.category
      `,
      // Top Products
      prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          category: string;
          quantitySold: number;
          revenue: number;
        }>
      >`
        SELECT
          p.id,
          p.name as name,
          p.category as category,
          SUM(si.quantity) as quantitySold,
          SUM(si.subtotal) as revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.branch_id = ${branchId}
          AND s.created_at BETWEEN ${fromDate} AND ${toDate}
        GROUP BY p.id, p.name, p.category
        ORDER BY revenue DESC
        LIMIT 5
      `,
      // Hourly Data
      prisma.$queryRaw<
        Array<{
          hour: string;
          hour_24: number;
          sales: number;
          transactions: number;
        }>
      >`
         SELECT
          DATE_FORMAT(created_at, '%h%p') as hour,
          HOUR(created_at) as hour_24,
          SUM(total_amount) as sales,
          COUNT(id) as transactions
        FROM sales
        WHERE branch_id = ${branchId}
          AND created_at BETWEEN ${fromDate} AND ${toDate}
        GROUP BY hour_24, hour
        ORDER BY hour_24
      `,
      //     `
      //     SELECT
      //   TO_CHAR(created_at, 'HH12AM') AS hour,
      //   EXTRACT(HOUR FROM created_at) AS hour_24,
      //   SUM(total_amount) AS sales,
      //   COUNT(id) AS transactions
      // FROM sales
      // WHERE branch_id = ${branchId}
      //   AND created_at BETWEEN ${fromDate} AND ${toDate}
      // GROUP BY hour_24, hour
      // ORDER BY hour_24;
      //     `,
      // Sales by employee
      prisma.sale.groupBy({
        by: ["cashierId"],
        _sum: { totalAmount: true },
        _count: true,
        where: baseConditions,
      }),
    ]);

    // Calculate growth percentages safely
    const calculateGrowth = (current: number, previous: number) =>
      previous === 0
        ? current === 0
          ? 0
          : 100
        : Number((((current - previous) / previous) * 100).toFixed(1));

    // Process financial metrics
    const currentTotalSales = currentSales._sum.totalAmount?.toNumber() || 0;
    const previousTotalSales = previousSales._sum.totalAmount?.toNumber() || 0;
    const salesGrowth = calculateGrowth(currentTotalSales, previousTotalSales);

    const currentTransactions = currentSales._count;
    const previousTransactions = previousSales._count;
    const transactionsGrowth = calculateGrowth(
      currentTransactions,
      previousTransactions
    );

    const avgTransaction =
      currentTransactions > 0 ? currentTotalSales / currentTransactions : 0;
    const prevAvgTransaction =
      previousTransactions > 0 ? previousTotalSales / previousTransactions : 0;
    const avgTransactionGrowth = calculateGrowth(
      avgTransaction,
      prevAvgTransaction
    );

    // Process payment methods
    const paymentMethodData = paymentMethods.map((method) => ({
      method: method.paymentMethod,
      count: method._count,
      amount: method._sum.totalAmount?.toNumber() || 0,
      percentage:
        currentTotalSales > 0
          ? ((method._sum.totalAmount?.toNumber() || 0) / currentTotalSales) *
            100
          : 0,
    }));

    // Process categories with growth calculations
    const currentCategoryMap = new Map(
      currentCategories.map((c) => [c.category, c.sales])
    );
    const previousCategoryMap = new Map(
      previousCategories.map((c) => [c.category, c.sales])
    );

    const categoryData = Array.from(currentCategoryMap.entries()).map(
      ([category, sales]) => ({
        category,
        sales: Number(sales),
        percentage:
          currentTotalSales > 0 ? (Number(sales) / currentTotalSales) * 100 : 0,
        growth: calculateGrowth(
          Number(sales),
          previousCategoryMap.get(category) || 0
        ),
      })
    );

    // Process top products
    const topProducts = products.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantitySold: Number(row.quantitySold),
      revenue: Number(row.revenue),
    }));

    // Process hourly data
    const hourlyData = hourly.map((row) => ({
      hour: row.hour,
      sales: Number(row.sales),
      transactions: Number(row.transactions),
    }));

    // Process employee data
    const employeeIds = employees.map((e) => e.cashierId);
    const employeeNames = await prisma.user.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true },
    });

    const employeeData = employees.map((emp) => {
      const name =
        employeeNames.find((e) => e.id === emp.cashierId)?.name || "Unknown";
      const sales = emp._sum.totalAmount?.toNumber() || 0;
      return {
        name,
        sales,
        transactions: emp._count,
        average: emp._count > 0 ? sales / emp._count : 0,
      };
    });

    return decimalToNumber({
      totalSales: currentTotalSales,
      salesGrowth,
      totalTransactions: currentTransactions,
      transactionsGrowth,
      averageTransactionValue: avgTransaction,
      avgTransactionGrowth,
      salesByPaymentMethod: paymentMethodData,
      salesByCategory: categoryData,
      topProducts,
      hourlyData,
      salesByEmployee: employeeData,
    });
  } catch (error) {
    console.error("Failed to generate sales report:", error);
    throw new Error("Failed to generate sales report");
  }
}
