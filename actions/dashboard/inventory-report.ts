"use server"

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

interface InventoryReportParams {
  lowStockOnly?: string;
}

interface InventoryReportData {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    lowStockThreshold: number;
    cost: number;
  }>;
  inventoryByCategory: Array<{
    name: string;
    productCount: number;
    totalStock: number;
    costValue: number;
    retailValue: number;
    potentialProfit: number;
  }>;
}

export const getInventoryReport = async ({
  lowStockOnly,
}: {
  lowStockOnly: boolean;
}) => {
  try {
    const user = await checkUser();    
    const branch = await prisma.user.findUnique({
      where: { id: user.id },
      select: { branchId: true },
    });

    if (!branch?.branchId) throw new Error("No branch found");
    const userBranchId = branch.branchId;

    const shouldShowLowStock = lowStockOnly === true;

    // Fetch branch products with product details
    const branchProducts = await prisma.branchProduct.findMany({
      where: {
        branchId: userBranchId,
      },
      include: {
        product: true,
      },
    });

    // Filter low stock items if requested
    const products = shouldShowLowStock
      ? branchProducts.filter((bp) => bp.stock <= bp.low_stock_threshold)
      : branchProducts;

    const totalProducts = branchProducts.length;
    const lowStockCount = branchProducts.filter(
      (bp) => bp.stock <= bp.low_stock_threshold
    ).length;
    const outOfStockCount = branchProducts.filter((bp) => bp.stock <= 0).length;

    // Calculate inventory value by category for the branch
    const inventoryByCategory: {
      [category: string]: {
        productCount: number;
        totalStock: number;
        costValue: number;
        retailValue: number;
        potentialProfit: number;
      };
    } = {};

    branchProducts.forEach((bp) => {
      const product = bp.product!;
      if (!inventoryByCategory[product.category]) {
        inventoryByCategory[product.category] = {
          productCount: 0,
          totalStock: 0,
          costValue: 0,
          retailValue: 0,
          potentialProfit: 0,
        };
      }
      inventoryByCategory[product.category].productCount++;
      inventoryByCategory[product.category].totalStock += bp.stock;
      inventoryByCategory[product.category].costValue +=
        Number(bp.cost) * bp.stock;
      // Assuming there's a 'price' field in BranchProduct for retail
      inventoryByCategory[product.category].retailValue +=
        Number(bp.price) * bp.stock;
      inventoryByCategory[product.category].potentialProfit +=
        (Number(bp.price) - Number(bp.cost)) * bp.stock;
    });

    const inventoryByCategoryArray = Object.entries(inventoryByCategory).map(
      ([name, data]) => ({ name, ...data })
    );

    const reportData: InventoryReportData = {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      products: products.map((bp) => ({
        id: bp.product!.id,
        name: bp.product!.name,
        sku: bp.product!.sku,
        category: bp.product!.category,
        stock: bp.stock,
        lowStockThreshold: bp.low_stock_threshold,
        cost: Number(bp.cost),
      })),
      inventoryByCategory: inventoryByCategoryArray,
    };
    console.log(reportData);
    return reportData;
  } catch (error: any) {
    throw new Error("Failed to fetch inventory report");
  }
};
