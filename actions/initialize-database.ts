"use server";

import { initializePermissions } from "@/lib/initialize-permissions";
import { Permission, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { saveSettings } from "@/lib/settings-service";
import { Branch, Product } from "@prisma/client";
import * as bcrypt from "bcrypt";

const generateProducts = (branch:Branch)=>{
  const TOTAL_PRODUCTS = 50;
  const CATEGORIES = [
    { name: "Beverages", prefix: "BEV", taxRate: 7.0, image: "1541167760496-1628856ab772" },
    { name: "Snacks", prefix: "SNK", taxRate: 7.0, image: "1558961363-fa8fdf82db35" },
    { name: "Fresh Produce", prefix: "PRD", taxRate: 0.0, image: "1569870499705-504209102861" },
    { name: "Dairy", prefix: "DRY", taxRate: 0.0, image: "1563636619-e9143da7973b" },
    { name: "Bakery", prefix: "BKY", taxRate: 7.0, image: "1549931319-a545dcf3bc7c" },
    { name: "Electronics", prefix: "ELC", taxRate: 7.0, image: "1583863788344-a671644ec6a0" },
    { name: "Clothing", prefix: "CLT", taxRate: 7.0, image: "1583863788344-a671644ec6a1" },
    { name: "Home Goods", prefix: "HOM", taxRate: 7.0, image: "1583863788344-a671644ec6a2" },
    { name: "Beauty", prefix: "BEA", taxRate: 7.0, image: "1583863788344-a671644ec6a3" },
    { name: "Books", prefix: "BOK", taxRate: 0.0, image: "1583863788344-a671644ec6a4" }
  ];

  const PRODUCT_TYPES = {
    Beverages: ["Coffee", "Tea", "Juice", "Soda", "Energy Drink"],
    Snacks: ["Cookies", "Chips", "Nuts", "Candy", "Granola Bars"],
    "Fresh Produce": ["Apples", "Bananas", "Carrots", "Lettuce", "Tomatoes"],
    Dairy: ["Milk", "Cheese", "Yogurt", "Butter", "Ice Cream"],
    Bakery: ["Bread", "Bagels", "Muffins", "Croissants", "Cakes"],
    Electronics: ["Charger", "Cable", "Headphones", "Case", "Adapter"],
    Clothing: ["T-Shirt", "Jeans", "Jacket", "Dress", "Sweater"],
    "Home Goods": ["Lamp", "Cushion", "Vase", "Curtains", "Rug"],
    Beauty: ["Shampoo", "Lotion", "Perfume", "Makeup", "Soap"],
    Books: ["Novel", "Textbook", "Cookbook", "Journal", "Guide"]
  } as any;

  const ADJECTIVES = ["Premium", "Organic", "Fresh", "Artisan", "Natural", "Deluxe", "Gourmet", "Vintage", "Handmade", "Sustainable"];

  // Helper functions
  const randomElement = (arr:string[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomPrice = (min:number, max:number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

  let products = [];
  let barcode = 1234567890123;
  const productsPerCategory = TOTAL_PRODUCTS / CATEGORIES.length;

  for (const category of CATEGORIES) {
    for (let i = 1; i <= productsPerCategory; i++) {
      products.push({
        name: `${randomElement(ADJECTIVES)} ${randomElement(PRODUCT_TYPES[category.name])}`,
        description: `${randomElement(ADJECTIVES)} ${randomElement(PRODUCT_TYPES[category.name])} - High quality product for daily use`,
        sku: `${category.prefix}-${String(i).padStart(5, '0')}`,
        barcode: (barcode++).toString(),
        category: category.name,
        image_url: `https://images.unsplash.com/photo-${category.image}?w=500&h=500&fit=crop`,
        branches: [{
          branch_id: branch.id,
          active: true,
          price: randomPrice(2, 50),
          cost: randomPrice(1, 25),
          taxRate: category.taxRate,
          stock: Math.floor(Math.random() * 100),
          low_stock_threshold: Math.floor(Math.random() * 10) + 5
        }]
      });
    }
  }

  return products;

}


export const initDatabase = async () => {
  try {
    console.log("Seeding database...");
    const settingsPayload = {
      DB_INITIALIZED: { value: "1", category: "DB" },
      productImages: { value: "false", category: "store" },
    };

    await saveSettings(settingsPayload);
    // Create default branch
    let branch = await prisma.branch.create({
      data: {
        name: process.env.DEFAULT_BRANCH_NAME as string,
        address: "Iraq, Erbil",
        isActive: true,
      },
    });
    // Create default permissions
    const permissions = Object.values(Permission).map((name) => ({ name }));
    await prisma.permission.createMany({
      data: permissions,
      skipDuplicates: true,
    });

    // Create default roles
    const roles = Object.values(UserRole).map((name) => ({ name }));
    await prisma.role.createMany({
      data: roles,
      skipDuplicates: true,
    });

    await initializePermissions();

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const cashierPassword = await bcrypt.hash("cashier123", 10);
    const managerPassword = await bcrypt.hash("manager123", 10);

    // Admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",

        roles: {
          connect: {
            name: UserRole.ADMIN,
          },
        },
        branchId: branch.id,
        branches: {
          connect: {
            id: branch.id,
          },
        },
      },
    });

    // Cashier user
    const cashierUser = await prisma.user.upsert({
      where: { email: "cashier@example.com" },
      update: {},
      create: {
        name: "Cashier User",
        email: "cashier@example.com",
        password: cashierPassword,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cashier",
        roles: {
          connect: {
            name: UserRole.CASHIER,
          },
        },
        branchId: branch.id,
        branches: {
          connect: {
            id: branch.id,
          },
        },
      },
    });

    // Manager user
    const managerUser = await prisma.user.upsert({
      where: { email: "manager@example.com" },
      update: {},
      create: {
        name: "Manager User",
        email: "manager@example.com",
        password: managerPassword,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
        roles: {
          connect: {
            name: UserRole.MANAGER,
          },
        },
        branchId: branch.id,
        branches: {
          connect: {
            id: branch.id,
          },
        },
      },
    });

    console.log("Users created");

    // Create product categories (used by products)
    // const categories = [
    //   "Beverages",
    //   "Snacks",
    //   "Fresh Produce",
    //   "Dairy",
    //   "Bakery",
    //   "Electronics",
    //   "Clothing",
    //   "Home Goods",
    //   "Beauty",
    //   "Books",
    // ];

    // Create products
    // const products = [
    //   {
    //     name: "Coffee",
    //     description: "Premium Arabica coffee beans",
    //     sku: "BEV-001",
    //     barcode: "1234567890123",
    //     category: "Beverages",
    //     image_url:
    //       "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 9.99,
    //         cost: 5.5,
    //         taxRate: 7.0,
    //         stock: 50,
    //         low_stock_threshold: 10,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Organic Tea",
    //     description: "Organic green tea leaves",
    //     sku: "BEV-002",
    //     barcode: "1234567890124",

    //     category: "Beverages",

    //     image_url:
    //       "https://images.unsplash.com/photo-1597481499750-5f8a6bcabe9d?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 6.99,
    //         cost: 3.2,
    //         taxRate: 7.0,
    //         stock: 40,
    //         low_stock_threshold: 8,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Chocolate Chip Cookies",
    //     description: "Freshly baked chocolate chip cookies",
    //     sku: "SNK-001",
    //     barcode: "2234567890123",

    //     category: "Snacks",

    //     image_url:
    //       "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 4.99,
    //         cost: 2.1,
    //         taxRate: 7.0,
    //         stock: 30,
    //         low_stock_threshold: 5,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Organic Apples",
    //     description: "Fresh organic apples",
    //     sku: "PRD-001",
    //     barcode: "3234567890123",
    //     category: "Fresh Produce",
    //     image_url:
    //       "https://images.unsplash.com/photo-1569870499705-504209102861?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 3.99,
    //         cost: 1.8,
    //         taxRate: 0.0,
    //         stock: 100,
    //         low_stock_threshold: 20,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Whole Milk",
    //     description: "Fresh whole milk, 1 gallon",
    //     sku: "DRY-001",
    //     barcode: "4234567890123",
    //     category: "Dairy",
    //     image_url:
    //       "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 3.49,
    //         cost: 2.0,
    //         taxRate: 0.0,
    //         stock: 25,
    //         low_stock_threshold: 5,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Artisan Bread",
    //     description: "Fresh baked artisan sourdough bread",
    //     sku: "BKY-001",
    //     barcode: "5234567890123",
    //     category: "Bakery",
    //     image_url:
    //       "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 4.5,
    //         cost: 2.25,
    //         taxRate: 7.0,
    //         stock: 15,
    //         low_stock_threshold: 3,
    //       },
    //     ],
    //   },
    //   {
    //     name: "Smartphone Charger",
    //     description: "Universal USB smartphone charger",
    //     sku: "ELC-001",
    //     barcode: "6234567890123",
    //     category: "Electronics",
    //     image_url:
    //       "https://images.unsplash.com/photo-1583863788344-a671644ec6a0?w=500&h=500&fit=crop",
    //     branches: [
    //       {
    //         branch_id: (await branch).id,
    //         active: true,
    //         price: 12.99,
    //         cost: 5.0,
    //         taxRate: 7.0,
    //         stock: 20,
    //         low_stock_threshold: 5,
    //       },
    //     ],
    //   },
    // ];

    // const products = generateProducts(branch)

    // for (const product of products) {
    //   const prod = await prisma.product.upsert({
    //     where: { sku: product.sku },
    //     update: {
    //       name: product.name,
    //       description: product.description,
    //       barcode: product.barcode,
    //       category: product.category,
    //       image_url: product.image_url,
    //     },
    //     create: {
    //       name: product.name,
    //       description: product.description,
    //       sku: product.sku,
    //       barcode: product.barcode,
    //       category: product.category,
    //       image_url: product.image_url,
    //       BranchProduct: {
    //         create: product.branches.map((branch) => ({
    //           branch: {
    //             connect: { id: branch.branch_id },
    //           },
    //           price: branch.price,
    //           cost: branch.cost,
    //           taxRate: branch.taxRate,
    //           stock: branch.stock,
    //           low_stock_threshold: branch.low_stock_threshold,
    //           isActive: branch.active,
    //         })),
    //       },
    //     },
    //   });

      // Optional: Update or upsert BranchProduct separately
      // for (const branch of product.branches) {
      //   await prisma.branchProduct.upsert({
      //     where: {
      //       productId_branchId: {
      //         productId: prod.id,
      //         branchId: branch.branch_id,
      //       },
      //     },
      //     update: {
      //       price: branch.price,
      //       cost: branch.cost,
      //       taxRate: branch.taxRate,
      //       stock: branch.stock,
      //       low_stock_threshold: branch.low_stock_threshold,
      //       isActive: branch.active,
      //     },
      //     create: {
      //       product: { connect: { id: prod.id } },
      //       branch: { connect: { id: branch.branch_id } },
      //       price: branch.price,
      //       cost: branch.cost,
      //       taxRate: branch.taxRate,
      //       stock: branch.stock,
      //       low_stock_threshold: branch.low_stock_threshold,
      //       isActive: branch.active,
      //     },
      //   });
      // }
    // }

    // console.log(`${products.length} products created`);

    // Create customers
    // const customers = [
    //   {
    //     name: "John Smith",
    //     email: "john.smith@example.com",
    //     phone: "555-123-4567",
    //     address: "123 Main St",
    //     city: "Anytown",
    //     state: "CA",
    //     postal_code: "12345",
    //     country: "USA",
    //     tax_exempt: false,
    //     notes: "Regular customer",
    //   },
    //   {
    //     name: "Jane Doe",
    //     email: "jane.doe@example.com",
    //     phone: "555-987-6543",
    //     address: "456 Oak Ave",
    //     city: "Somewhere",
    //     state: "NY",
    //     postal_code: "67890",
    //     country: "USA",
    //     tax_exempt: true,
    //     notes: "Tax exempt business customer",
    //   },
    //   {
    //     name: "Bob Johnson",
    //     email: "bob.johnson@example.com",
    //     phone: "555-567-8901",
    //     address: "789 Pine Rd",
    //     city: "Elsewhere",
    //     state: "TX",
    //     postal_code: "45678",
    //     country: "USA",
    //     tax_exempt: false,
    //     notes: "Prefers delivery",
    //   },
    // ];

    // for (const customer of customers) {
    //   await prisma.customer.upsert({
    //     where: { email: customer.email },
    //     update: customer,
    //     create: customer,
    //   });
    // }

    // console.log(`${customers.length} customers created`);

    // Fix: Create registers with correct data structure
    // const registers = [
    //   {
    //     name: "Register 1",
    //     status: "CLOSED",
    //     openingBalance: 200.0,
    //   },
    //   {
    //     name: "Register 2",
    //     status: "CLOSED",
    //     openingBalance: 200.0,
    //   },
    // ];

    // for (const register of registers) {
    //   // Fix: Remove fields that might be causing issues and only use essential fields
    //   const registerData = {
    //     name: register.name,
    //     status: register.status as any, // Cast to any to handle enum
    //     openingBalance: register.openingBalance,
    //   };

    //   await prisma.register.upsert({
    //     where: {
    //       name: register.name as
    //         | string
    //         | Prisma.StringFilter<"Register">
    //         | undefined,
    //     },
    //     update: registerData,
    //     create: registerData,
    //   });
    // }

    // console.log(`${registers.length} registers created`);

    // Fix: Create discounts with correct data structure
    // const today = new Date();
    // const nextMonth = new Date(today);
    // nextMonth.setMonth(nextMonth.getMonth() + 1);

    // const discounts = [
    //   {
    //     name: "10% Off All Products",
    //     code: "SUMMER10",
    //     type: "PERCENTAGE",
    //     value: 10.0,
    //     minPurchaseAmount: 20.0,
    //     appliesTo: "ENTIRE_ORDER",
    //     startDate: today,
    //     endDate: nextMonth,
    //     maxUses: 100,
    //     currentUses: 0,
    //     isActive: true,
    //   },
    //   {
    //     name: "$5 Off Beverages",
    //     code: "DRINKS5",
    //     type: "FIXED",
    //     value: 5.0,
    //     minPurchaseAmount: 15.0,
    //     appliesTo: "SPECIFIC_CATEGORIES",
    //     categoryIds: "Beverages",
    //     startDate: today,
    //     endDate: nextMonth,
    //     maxUses: 50,
    //     currentUses: 0,
    //     isActive: true,
    //   },
    //   {
    //     name: "Buy 1 Get 1 Snacks",
    //     code: "BOGO",
    //     type: "BUY_X_GET_Y",
    //     value: 100.0, // 100% off second item
    //     appliesTo: "SPECIFIC_CATEGORIES",
    //     categoryIds: "Snacks",
    //     buyXQuantity: 1,
    //     getYQuantity: 1,
    //     startDate: today,
    //     endDate: nextMonth,
    //     maxUses: 30,
    //     currentUses: 0,
    //     isActive: true,
    //   },
    // ];

    // for (const discount of discounts) {
    //   // Fix: Ensure enums are properly typed
    //   const discountData = {
    //     name: discount.name,
    //     code: discount.code,
    //     type: discount.type as any, // Cast to any to handle enum
    //     value: discount.value,
    //     minPurchaseAmount: discount.minPurchaseAmount,
    //     appliesTo: discount.appliesTo as any, // Cast to any to handle enum
    //     categoryIds: discount.categoryIds,
    //     buyXQuantity: discount.buyXQuantity,
    //     getYQuantity: discount.getYQuantity,
    //     startDate: discount.startDate,
    //     endDate: discount.endDate,
    //     maxUses: discount.maxUses,
    //     currentUses: discount.currentUses,
    //     isActive: discount.isActive,
    //   };

    //   await prisma.discount.upsert({
    //     where: { code: discount.code },
    //     update: discountData,
    //     create: discountData,
    //   });
    // }
    // console.log(`${discounts.length} discounts created`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};
