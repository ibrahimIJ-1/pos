// actions/reports/profit-report.ts
"use server";

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

interface ProfitReportData {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  revenueGrowth?: number;
  profitGrowth?: number;
  profitByCategory: Array<{
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  mostProfitableProducts: Array<{
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export const getProfitReport = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<ProfitReportData> => {
  const user = await checkUser();
  const branch = await prisma.user.findUnique({
    where: { id: user.id },
    select: { branchId: true },
  });

  if (!branch?.branchId) throw new Error("No branch found");
  const branchId = branch.branchId;

  const startDate = new Date(from);
  const endDate = new Date(to);
  endDate.setDate(endDate.getDate() + 1);

  try {
    // 1. Total Revenue
    const totalRevenueResult = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { branchId, created_at: { gte: startDate, lt: endDate } },
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount?.toNumber() || 0;

    // 2. Total Costs (using historical cost at sale time)
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: { branchId, created_at: { gte: startDate, lt: endDate } },
      },
      include: { product: true },
    });

    // Get costs for all products in one query
    const productIds = [...new Set(saleItems.map((item) => item.productId))];
    const branchProducts = await prisma.branchProduct.findMany({
      where: { branchId, productId: { in: productIds } },
    });

    const productCostMap = new Map(
      branchProducts.map((bp) => [bp.productId, bp.cost.toNumber()])
    );

    const totalCosts = saleItems.reduce((acc, item) => {
      const cost = productCostMap.get(item.productId) || 0;
      return acc + cost * item.quantity;
    }, 0);

    // 3. Gross Profit & Margin
    const grossProfit = totalRevenue - totalCosts;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 4. Profit by Category
    const categorySales = await prisma.$queryRaw`
      SELECT 
        p.category as name,
        SUM(si.unit_price * si.quantity) as revenue,
        SUM(bp.cost * si.quantity) as cost
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN branch_products bp ON bp.product_id = si.product_id AND bp.branch_id = ${branchId}
      JOIN sales s ON s.id = si.sale_id
      WHERE s.branch_id = ${branchId}
        AND s.created_at >= ${startDate}
        AND s.created_at < ${endDate}
      GROUP BY p.category
    `;

    const profitByCategory = (categorySales as any[]).map((row) => ({
      name: row.name,
      revenue: Number(row.revenue),
      cost: Number(row.cost),
      profit: Number(row.revenue) - Number(row.cost),
      margin:
        Number(row.revenue) > 0
          ? ((Number(row.revenue) - Number(row.cost)) / Number(row.revenue)) *
            100
          : 0,
    }));

    // 5. Most Profitable Products
    const productSales = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: {
        sale: { branchId, created_at: { gte: startDate, lt: endDate } },
      },
      _sum: {
        unitPrice: true,
        quantity: true,
      },
      orderBy: { _sum: { unitPrice: "desc" } },
      take: 10,
    });

    const productDetails = await prisma.product.findMany({
      where: { id: { in: productSales.map((p) => p.productId) } },
      include: { BranchProduct: { where: { branchId } } },
    });

    const mostProfitableProducts = productSales.map((sale) => {
      const product = productDetails.find((p) => p.id === sale.productId);
      const bp = product?.BranchProduct[0];
      const revenue =
        (sale._sum.unitPrice?.toNumber() || 0) * (sale._sum.quantity || 0);
      const cost = (bp?.cost.toNumber() || 0) * (sale._sum.quantity || 0);

      return {
        id: sale.productId,
        name: product?.name || "Unknown",
        unitsSold: sale._sum.quantity || 0,
        revenue,
        cost,
        profit: revenue - cost,
        margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
      };
    });

    return {
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      profitByCategory,
      mostProfitableProducts,
    };
  } catch (error: any) {
    console.error("Profit report error:", error);
    throw new Error("Failed to generate profit report");
  } finally {
    await prisma.$disconnect();
  }
};
