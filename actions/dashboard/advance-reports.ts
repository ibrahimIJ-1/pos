// actions/reports/profit-report.ts
"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { decimalToNumber } from "@/lib/utils";

interface ProfitReportData {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  summary?: Array<{ label: string; value: string | number; change?: number }>;
  chartData?: Array<{ date: string; [key: string]: number | string }>;
  categories?: string[];
  colors?: string[];
  tableHeaders?: string[];
  tableData?: Array<Array<string | number>>;
  totalOrders?: number;
  averageOrderValue?: number;
  totalProducts?: number;
  outOfStockCount?: number;
  lowStockCount?: number;
  inventoryValue?: number;
  inventoryByCategory?: Array<{
    name: string;
    productCount: number;
    totalStock: number;
    value: number;
  }>;
  lowStockProducts?: Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  totalCustomers?: number;
  newCustomers?: number;
  returningCustomers?: number;
  retentionRate?: number;
  averagePurchaseValue?: number;
  topCustomers?: Array<{
    id: string;
    name: string;
    totalSpend: number;
    purchaseCount: number;
    lastPurchase: Date;
  }>;
}

export const getAdvancedReport = async (
  reportType: "sales" | "inventory" | "customers" | "profit",
  dateRange: "day" | "week" | "month" | "quarter" | "year" | "custom",
  fromDate?: Date,
  toDate?: Date
): Promise<ProfitReportData> => {
  const user = await checkUser();
  const branch = await prisma.user.findUnique({
    where: { id: user.id },
    select: { branchId: true },
  });

  if (!branch?.branchId) throw new Error("No branch found");
  const branchId = branch.branchId;

  // Date range calculation
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (dateRange) {
    case "day":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case "week":
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfWeek(now, { weekStartsOn: 0 });
      break;
    case "month":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case "quarter": {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = startOfMonth(
        new Date(now.getFullYear(), quarterStartMonth, 1)
      );
      endDate = endOfMonth(
        new Date(now.getFullYear(), quarterStartMonth + 2, 31)
      );
      break;
    }
    case "year":
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case "custom":
      if (!fromDate || !toDate) throw new Error("Missing custom date range");
      startDate = fromDate;
      endDate = toDate;
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
  }

  endDate.setDate(endDate.getDate() + 1); // Include end date

  try {
    if (reportType === "profit") {
      // 1. Fetch all necessary data in optimized queries
      const [sales, saleItems] = await Promise.all([
        prisma.sale.findMany({
          where: { branchId, created_at: { gte: startDate, lt: endDate } },
          select: { id: true, created_at: true, totalAmount: true },
        }),
        prisma.saleItem.findMany({
          where: {
            sale: { branchId, created_at: { gte: startDate, lt: endDate } },
          },
          select: { productId: true, quantity: true, saleId: true },
        }),
      ]);

      // 2. Batch product cost lookup
      const productIds = [...new Set(saleItems.map((item) => item.productId))];
      const branchProducts = await prisma.branchProduct.findMany({
        where: { branchId, productId: { in: productIds } },
        select: { productId: true, cost: true },
      });

      const productCostMap = new Map(
        branchProducts.map((bp) => [bp.productId, bp.cost.toNumber()])
      );

      // 3. Calculate totals
      const totalRevenue = sales.reduce(
        (sum, sale) => sum + (sale.totalAmount?.toNumber() || 0),
        0
      );

      const totalCosts = saleItems.reduce((sum, item) => {
        const cost = productCostMap.get(item.productId) || 0;
        return sum + cost * item.quantity;
      }, 0);

      const grossProfit = totalRevenue - totalCosts;
      const profitMargin =
        totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // 4. Generate chart data with optimized date grouping
      const dateMap = new Map<string, { revenue: number; cost: number }>();

      // Process sales
      sales.forEach((sale) => {
        const dateKey = format(sale.created_at!, "yyyy-MM-dd");
        const current = dateMap.get(dateKey) || { revenue: 0, cost: 0 };
        current.revenue += sale.totalAmount?.toNumber() || 0;
        dateMap.set(dateKey, current);
      });

      // Process costs
      const saleItemsWithDates = await prisma.saleItem.findMany({
        where: { saleId: { in: sales.map((s) => s.id) } },
        select: {
          productId: true,
          quantity: true,
          sale: { select: { created_at: true } },
        },
      });

      saleItemsWithDates.forEach((item) => {
        const dateKey = format(item.sale.created_at!, "yyyy-MM-dd");
        const current = dateMap.get(dateKey) || { revenue: 0, cost: 0 };
        const cost = productCostMap.get(item.productId) || 0;
        current.cost += cost * item.quantity;
        dateMap.set(dateKey, current);
      });

      // Convert to sorted chart data
      const chartData = Array.from(dateMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, values]) => ({
          date,
          Revenue: values.revenue,
          Cost: values.cost,
          Profit: values.revenue - values.cost,
        }));

      // 5. Generate summary
      const summary = [
        { label: "Total Revenue", value: totalRevenue.toFixed(2), change: 0 },
        { label: "Total Costs", value: totalCosts.toFixed(2), change: 0 },
        { label: "Gross Profit", value: grossProfit.toFixed(2), change: 0 },
        {
          label: "Profit Margin",
          value: `${profitMargin.toFixed(2)}%`,
          change: 0,
        },
      ];

      return {
        totalRevenue,
        totalCosts,
        grossProfit,
        profitMargin,
        summary,
        chartData,
        categories: ["Revenue", "Cost", "Profit"],
        colors: ["blue", "red", "green"],
      };
    }
    if (reportType === "sales") {
      const [salesData, dailySales, topProducts] = await Promise.all([
        prisma.sale.aggregate({
          _sum: { totalAmount: true },
          _count: { id: true },
          where: { branchId, created_at: { gte: startDate, lt: endDate } },
        }),
        prisma.$queryRaw<{ date: string; total: number }[]>`
            SELECT 
              DATE(created_at) as date,
              SUM(total_amount) as total
            FROM sales
            WHERE branch_id = ${branchId}
              AND created_at >= ${startDate}
              AND created_at < ${endDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          `,
        prisma.saleItem.groupBy({
          by: ["productName"],
          _sum: { quantity: true },
          where: {
            sale: { branchId, created_at: { gte: startDate, lt: endDate } },
          },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        }),
      ]);

      const totalRevenue = salesData._sum.totalAmount?.toNumber() || 0;
      const totalOrders = salesData._count.id;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const chartData = dailySales.map((daily) => ({
        date: format(new Date(daily.date), "yyyy-MM-dd"),
        Sales: daily.total,
      }));

      const summary = [
        { label: "Total Sales", value: totalRevenue.toFixed(2) },
        { label: "Transactions", value: totalOrders },
        { label: "Average Order", value: averageOrderValue.toFixed(2) },
      ];

      return decimalToNumber({
        totalRevenue,
        totalCosts: 0,
        grossProfit: 0,
        profitMargin: 0,
        totalOrders,
        averageOrderValue,
        summary,
        chartData,
        categories: ["Sales"],
        colors: ["#3b82f6"],
        tableHeaders: ["Product", "Units Sold"],
        tableData: topProducts.map((p) => [
          p.productName,
          p._sum.quantity?.toString() || "0",
        ]),
      }) as ProfitReportData;
    }

    if (reportType === "inventory") {
      const inventoryData = await prisma.branchProduct.findMany({
        where: { branchId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              sku: true,
            },
          },
        },
      });

      // Calculate inventory metrics
      const totalProducts = inventoryData.length;
      const lowStockCount = inventoryData.filter(
        (bp) => bp.stock <= bp.low_stock_threshold
      ).length;
      const outOfStockCount = inventoryData.filter(
        (bp) => bp.stock <= 0
      ).length;
      const inventoryValue = inventoryData.reduce(
        (sum, bp) => sum + Number(bp.cost) * bp.stock,
        0
      );

      // Group by category
      const inventoryByCategory = inventoryData.reduce((acc, bp) => {
        const category = bp.product.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = {
            productCount: 0,
            totalStock: 0,
            value: 0,
          };
        }
        acc[category].productCount++;
        acc[category].totalStock += bp.stock;
        acc[category].value += Number(bp.cost) * bp.stock;
        return acc;
      }, {} as Record<string, { productCount: number; totalStock: number; value: number }>);

      // Format low stock products
      const lowStockProducts = inventoryData
        .filter((bp) => bp.stock <= bp.low_stock_threshold)
        .map((bp) => ({
          id: bp.productId,
          name: bp.product.name,
          stock: bp.stock,
          lowStockThreshold: bp.low_stock_threshold,
        }));

      // Create summary
      const summary = [
        { label: "Total Products", value: totalProducts },
        { label: "Low Stock Items", value: lowStockCount },
        { label: "Out of Stock", value: outOfStockCount },
        { label: "Inventory Value", value: `$${inventoryValue.toFixed(2)}` },
      ];

      // Create table data
      const tableData = Object.entries(inventoryByCategory).map(
        ([category, data]) => [
          category,
          data.productCount,
          data.totalStock,
          `$${data.value.toFixed(2)}`,
        ]
      );

      return {
        totalRevenue: 0,
        totalCosts: 0,
        grossProfit: 0,
        profitMargin: 0,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        inventoryValue,
        inventoryByCategory: Object.entries(inventoryByCategory).map(
          ([name, data]) => ({
            name,
            ...data,
          })
        ),
        lowStockProducts,
        summary,
        chartData: [], // Add chart data if needed
        categories: ["Inventory Value"],
        colors: ["#6366f1"],
        tableHeaders: ["Category", "Products", "Total Stock", "Value"],
        tableData,
      };
    }

    if (reportType === "customers") {
      const [customerStats, activeCustomers, historicalCustomers, topSpenders] =
        await Promise.all([
          prisma.sale.groupBy({
            by: ["customerId"],
            where: {
              branchId,
              created_at: { gte: startDate, lt: endDate },
              customerId: { not: null },
            },
            _count: { _all: true }, // Fixed count syntax
            _sum: { totalAmount: true },
          }),
          prisma.sale.findMany({
            distinct: ["customerId"],
            where: {
              branchId,
              created_at: { gte: startDate, lt: endDate },
              customerId: { not: null },
            },
            select: { customerId: true },
          }),
          prisma.sale.findMany({
            distinct: ["customerId"],
            where: {
              branchId,
              created_at: { lt: startDate },
              customerId: { not: null },
            },
            select: { customerId: true },
          }),
          prisma.sale.groupBy({
            by: ["customerId"],
            where: {
              branchId,
              created_at: { gte: startDate, lt: endDate },
              customerId: { not: null },
            },
            _sum: { totalAmount: true },
            _count: { _all: true }, // Added count for purchases
            orderBy: { _sum: { totalAmount: "desc" } },
            take: 10,
          }),
        ]);

      // Calculate metrics
      const totalCustomers = activeCustomers.length;
      const newCustomers = activeCustomers.filter(
        (ac) =>
          !historicalCustomers.some((hc) => hc.customerId === ac.customerId)
      ).length;
      const returningCustomers = totalCustomers - newCustomers;
      const retentionRate =
        historicalCustomers.length > 0
          ? (returningCustomers / historicalCustomers.length) * 100
          : 0;

      const totalRevenue = customerStats.reduce(
        (sum, stat) => sum + Number(stat._sum.totalAmount || 0),
        0
      );
      const averagePurchaseValue =
        totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Get top customer details with last purchase
      const customerDetails = await prisma.customer.findMany({
        where: {
          id: { in: topSpenders.map((t) => t.customerId!) },
        },
        include: {
          sales: {
            orderBy: { created_at: "desc" },
            take: 1,
            select: { created_at: true },
          },
        },
      });

      const topCustomers = topSpenders.map((spender) => {
        const customer = customerDetails.find(
          (c) => c.id === spender.customerId
        );
        return {
          id: spender.customerId!,
          name: customer?.name || "Unknown",
          totalSpend: Number(spender._sum.totalAmount || 0),
          purchaseCount: spender._count._all, // Use correct count property
          lastPurchase: customer?.sales[0]?.created_at || new Date(),
        };
      });

      // Create chart data (customer acquisition timeline)
      const acquisitionData = await prisma.$queryRaw<
        { date: string; count: number }[]
      >`
          SELECT 
            DATE(first_purchase) as date,
            COUNT(*) as count
          FROM (
            SELECT 
              customer_id,
              MIN(created_at) as first_purchase
            FROM sales
            WHERE branch_id = ${branchId}
            GROUP BY customer_id
          ) as first_purchases
          WHERE first_purchase >= ${startDate}
            AND first_purchase < ${endDate}
          GROUP BY DATE(first_purchase)
          ORDER BY date ASC
        `;

      const chartData = acquisitionData.map((d) => ({
        date: format(new Date(d.date), "yyyy-MM-dd"),
        Customers: Number(d.count),
      }));

      const summary = [
        { label: "Total Customers", value: totalCustomers },
        { label: "New Customers", value: newCustomers },
        { label: "Returning Customers", value: returningCustomers },
        { label: "Retention Rate", value: `${retentionRate.toFixed(1)}%` },
        { label: "Avg Spend", value: `$${averagePurchaseValue.toFixed(2)}` },
      ];

      return {
        totalRevenue: 0,
        totalCosts: 0,
        grossProfit: 0,
        profitMargin: 0,
        totalCustomers,
        newCustomers,
        returningCustomers,
        retentionRate,
        averagePurchaseValue,
        topCustomers,
        summary,
        chartData,
        categories: ["Customers"],
        colors: ["#8b5cf6"],
        tableHeaders: ["Customer", "Total Spend", "Purchases"],
        tableData: topCustomers.map((c) => [
          c.name,
          `$${c.totalSpend.toFixed(2)}`,
          c.purchaseCount,
        ]),
      };
    }

    // Handle other report types here...

    return {
      totalRevenue: 0,
      totalCosts: 0,
      grossProfit: 0,
      profitMargin: 0,
      summary: [{ label: "Unsupported Report", value: "N/A" }],
      chartData: [],
      categories: [],
      colors: [],
    };
  } catch (error: any) {
    console.error("Advanced report error:", error);
    throw new Error(`Failed to generate ${reportType} report`);
  } finally {
    await prisma.$disconnect();
  }
};
