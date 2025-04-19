"use server";

import { prisma } from "@/lib/prisma";
import { Product, BranchProduct, Branch } from "@prisma/client";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";

export async function uploadProductsFromExcel(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return { success: false, error: "No worksheet found" };
    }

    // Get all branches first to map names to IDs
    const allBranches = await prisma.branch.findMany();
    const branchNameToIdMap = new Map(
      allBranches.map((b) => [b.name.toLowerCase(), b.id])
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process rows sequentially to handle operations properly
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      try {
        // Extract product data
        const barcode = row.getCell(4).value?.toString() || undefined;
        const branchName = row.getCell(6).value?.toString();
        // console.log("@BARCODE",row.getCell(2).value?.toString());
        
        if (!branchName) {
          errors.push(`Row ${rowNumber}: Branch name is required`);
          errorCount++;
          continue;
        }

        const branchId = branchNameToIdMap.get(branchName.toLowerCase());
        if (!branchId) {
          errors.push(`Row ${rowNumber}: Branch "${branchName}" not found`);
          errorCount++;
          continue;
        }

        // Handle image URL (assuming it's a string URL or path in the Excel)
        let image_url: string | undefined = undefined;
        const imageCell = row.getCell(12); // Assuming image is in column 12
        if (imageCell.value) {
          const imageValue = imageCell.value?.toString();
          if (imageValue) {
            // If it's a URL, use it directly
            if (imageValue.startsWith("http")) {
              image_url = imageValue;
            } else {
              const base64String = imageCell.value.toString();
              // Implement a function to upload from base64
            //   image_url = await uploadFileFromBase64(base64String, true);
            }
          }
        }

        const productData = {
          name: row.getCell(1).value?.toString() || "",
          description: row.getCell(2).value?.toString() || "",
          sku: row.getCell(3).value?.toString() || "",
          barcode,
          category: row.getCell(5).value?.toString() || "Uncategorized",
          image_url,
        };

        const newStock = parseInt(row.getCell(10).value?.toString() || "0");
        const branchProductData = {
          price: parseFloat(row.getCell(7).value?.toString() || "0"),
          cost: parseFloat(row.getCell(8).value?.toString() || "0"),
          taxRate: parseFloat(row.getCell(9).value?.toString() || "0"),
          stock: newStock,
          low_stock_threshold: parseInt(
            row.getCell(11).value?.toString() || "10"
          ),
          isActive: true,
        };

        // Upsert product (create or update by barcode)
        let product: Product;
        if (barcode) {
          // Try to find existing product by barcode
          const existingProduct = await prisma.product.findFirst({
            where: { barcode },
          });

          if (existingProduct) {
            // Update existing product
            product = await prisma.product.update({
              where: { id: existingProduct.id },
              data: productData,
            });
          } else {
            // Create new product
            product = await prisma.product.create({
              data: productData,
            });
          }
        } else {
          // Create new product (no barcode to match)
          product = await prisma.product.create({
            data: productData,
          });
        }

        // Check if branch product exists
        const existingBranchProduct = await prisma.branchProduct.findUnique({
          where: {
            productId_branchId: {
              productId: product.id,
              branchId,
            },
          },
        });

        if (existingBranchProduct) {
          // Update existing branch product and increment stock
          await prisma.branchProduct.update({
            where: {
              productId_branchId: {
                productId: product.id,
                branchId,
              },
            },
            data: {
              ...branchProductData,
              stock: {
                increment: newStock, // Increment existing stock by new quantity
              },
            },
          });
        } else {
          // Create new branch product
          await prisma.branchProduct.create({
            data: {
              ...branchProductData,
              productId: product.id,
              branchId,
            },
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push(
          `Row ${rowNumber}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errorCount++;
      }
    }

    revalidatePath("/products");
    return {
      success: true,
      count: successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${successCount} products successfully${
        errorCount > 0 ? `, with ${errorCount} errors` : ""
      }`,
    };
  } catch (error) {
    console.error("Error importing products:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to import products",
    };
  }
}

// async function excelImageToFile(imageCell: ExcelJS.Cell): Promise<File | null> {
//   if (!imageCell.value) return null;

//   // Handle different types of image data in Excel
//   if (imageCell.type === ExcelJS.) {
//     // For embedded images
//     const image = imageCell.value as ExcelJS.Image;
//     return new File(
//       [Buffer.from(image.buffer)],
//       `image_${Date.now()}.${image.extension}`,
//       {
//         type: `image/${image.extension}`,
//       }
//     );
//   } else if (typeof imageCell.value === "string") {
//     // For base64 strings or URLs
//     const strValue = imageCell.value.toString();

//     // Check if it's a base64 string
//     if (strValue.startsWith("data:image")) {
//       const matches = strValue.match(/^data:(image\/\w+);base64,(.+)$/);
//       if (matches && matches.length === 3) {
//         const mimeType = matches[1];
//         const buffer = Buffer.from(matches[2], "base64");
//         const extension = mimeType.split("/")[1];
//         return new File([buffer], `image_${Date.now()}.${extension}`, {
//           type: mimeType,
//         });
//       }
//     }

//     // If it's a URL, we might want to download it first
//     // (Implementation depends on your requirements)
//   }

//   return null;
// }
