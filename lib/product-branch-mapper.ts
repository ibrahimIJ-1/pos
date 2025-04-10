import { BranchProduct, Product } from "@prisma/client";
export interface ProductPOS {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  category: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  price: number;
  cost: number;
  taxRate: number;
  stock: number;
  low_stock_threshold: number;
  isActive: boolean;
}

export const productBranchPOSMapper = (
  products: (Product & { BranchProduct: Array<BranchProduct> })[]
) => {
  if (!products || products.length <= 0) return [];
  const posProducts: ProductPOS[] = products.map((branchProduct) => {
    return {
      id: branchProduct.id,
      name: branchProduct.name,
      description: branchProduct.description,
      sku: branchProduct.sku,
      barcode: branchProduct.barcode,
      category: branchProduct.category,
      image_url: branchProduct.image_url,
      created_at: branchProduct.created_at,
      updated_at: branchProduct.updated_at,
      price: Number(branchProduct.BranchProduct[0].price),
      cost: Number(branchProduct.BranchProduct[0].cost),
      taxRate: Number(branchProduct.BranchProduct[0].taxRate),
      stock: branchProduct.BranchProduct[0].stock,
      low_stock_threshold: branchProduct.BranchProduct[0].low_stock_threshold,
      isActive: branchProduct.BranchProduct[0].isActive,
    };
  });
  return posProducts;
};
