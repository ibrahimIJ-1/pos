"use server";

import { prisma } from "@/lib/prisma";
import { WarehouseTransactionType } from "@prisma/client";

export interface WarehouseTransactionItemsInterface {
  id?: string;
  warehouseId: string;
  shelfId?: string;
  productId: string;
  quantity: number;
  referenceId: string;
}

export const logWarehouseTransactionItems = async (
  data: WarehouseTransactionItemsInterface[],
  referenceId?: string
) => {
  try {
    await hardDeleteWarehouseTransactionItems(referenceId || "");
    await prisma.warehouseTransactionItems.createMany({
      data,
    });
    return true;
  } catch (error) {
    console.error("Error logging warehouse transaction:", error);
    throw new Error("Failed to log warehouse transaction");
  }
};

export const softDeleteWarehouseTransactionItems = async (
  referenceId: string
) => {
  try {
    await prisma.warehouseTransactionItems.updateMany({
      where: {
        referenceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};

export const hardDeleteWarehouseTransactionItems = async (
  referenceId: string
) => {
  try {
    await prisma.warehouseTransactionItems.deleteMany({
      where: {
        referenceId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};

export const getWarehouseTransactionItems = async (referenceId: string) => {
  try {
    await prisma.warehouseTransactionItems.deleteMany({
      where: {
        referenceId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting warehouse transaction:", error);
    throw new Error("Failed to delete warehouse transaction");
  }
};

export const getWarehouseItemsWithAvailableShelves = async (
  warehouseId?: string
) => {
  try {
    const where: any = { deletedAt: null };
    if (warehouseId) where.warehouseId = warehouseId;

    // Step 1: Aggregate in DB
    const groups: Array<{
      warehouseId: string;
      productId: string;
      shelfId: string | null;
      _sum: { quantity: { toString?: () => string } | null } | null;
    }> = await prisma.warehouseTransactionItems.groupBy({
      by: ["warehouseId", "productId", "shelfId"],
      where,
      _sum: { quantity: true },
    } as any);

    // Step 2: Collect all productIds and shelfIds
    const productIds = [...new Set(groups.map(g => g.productId))];
    const shelfIds = [...new Set(groups.map(g => g.shelfId).filter(Boolean))] as string[];

    // Step 3: Fetch product & shelf names
    const [products, shelves] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      }),
      prisma.shelf.findMany({
        where: { id: { in: shelfIds } },
        select: { id: true, name: true },
      }),
    ]);

    // Step 4: Create lookup maps
    const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));
    const shelfMap = Object.fromEntries(shelves.map(s => [s.id, s.name]));

    // Step 5: Build the nested structure
    const resultMap = new Map<
      string,
      Map<
        string,
        Array<{ id: string | null; quantity: number; shelfName: string | null }>
      >
    >();

    for (const g of groups) {
      const w = g.warehouseId;
      const p = g.productId;
      const s = g.shelfId ?? null;
      const q = g._sum?.quantity ? Number((g._sum.quantity as any).toString()) : 0;

      if (!resultMap.has(w)) resultMap.set(w, new Map());
      const prodMap = resultMap.get(w)!;

      if (!prodMap.has(p)) prodMap.set(p, []);
      const shelves = prodMap.get(p)!;

      shelves.push({
        id: s,
        quantity: q,
        shelfName: s ? shelfMap[s] || null : null,
      });
    }

    // Step 6: Convert to array output
    const result: Array<{
      warehouseId: string;
      Items: Array<{
        productId: string;
        productName: string | null;
        Shelves: Array<{ id: string | null; shelfName: string | null; quantity: number }>;
      }>;
    }> = [];

    for (const [wId, prodMap] of resultMap.entries()) {
      const items: Array<{
        productId: string;
        productName: string | null;
        Shelves: Array<{ id: string | null; shelfName: string | null; quantity: number }>;
      }> = [];

      for (const [pId, shelves] of prodMap.entries()) {
        items.push({
          productId: pId,
          productName: productMap[pId] || null,
          Shelves: shelves,
        });
      }

      result.push({ warehouseId: wId, Items: items });
    }

    return result;
  } catch (error) {
    console.error("Error fetching warehouse items with shelves:", error);
    throw new Error("Failed to get warehouse items");
  }
};
