"use server";

import ExcelJS from "exceljs";

export async function getProductsTemplate() {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products Template");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Barcode", key: "barcode", width: 20 },
      { header: "Category", key: "category", width: 20 },
      { header: "Branch", key: "branchName", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "Cost", key: "cost", width: 15 },
      { header: "Tax Rate", key: "taxRate", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
      { header: "Low Stock Threshold", key: "lowStockThreshold", width: 20 },
    ];

    // Add some example data
    worksheet.addRow({
      name: "Example Product",
      description: "This is an example product",
      sku: "EX-001",
      barcode: "123456789012",
      category: "Examples",
      branchName: "ibrahim",
      price: 19.99,
      cost: 10.5,
      taxRate: 0.08,
      stock: 100,
      lowStockThreshold: 10,
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Convert to base64
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, data: base64 };
  } catch (error) {
    console.error("Error generating template:", error);
    return { success: false, error: "Failed to generate template" };
  }
}
