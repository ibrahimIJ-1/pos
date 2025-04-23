"use server";

import bwipjs from "bwip-js";
import { PDFDocument, rgb } from "pdf-lib";
import { checkUser } from "../Authorization";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { uploadFile } from "../tools/s3-bucket-uploader";

export const downloadBarcodePDF = async (ids: string[] | null) => {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const userBranch = await prisma.user.findUnique({
    where: { id: user.id },
    select: { branchId: true },
  });
  if (!userBranch?.branchId) throw new Error("User branch not found");
  let conditions: any = {};
  if (ids && ids.length > 0) {
    conditions.id = {
      in: ids,
    };
  }
  const products = await prisma.product.findMany({
    where: {
      BranchProduct: { some: { branchId: userBranch.branchId } },
      barcode: {
        not: null,
      },
      ...conditions,
    },
  });
  if (products.length === 0) throw new Error("No products found");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Layout configuration
  const margin = 10;
  const numColumns = 4;
  const cellWidth = (width - margin * 2) / numColumns;
  const cellHeight = 70;
  const verticalSpacing = 5;
  const textPadding = 2;

  let currentPage = page;
  let x = margin;
  let y = height - margin - cellHeight;

  for (const product of products) {
    // Generate barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: product.barcode!,
      scale: 4,
      height: 12,
      includetext: true,
    });

    const pngImage = await pdfDoc.embedPng(barcodeBuffer);

    // Calculate image scaling
    const maxImageWidth = cellWidth - margin;
    const maxImageHeight = 80;
    const scale = Math.min(
      maxImageWidth / pngImage.width,
      maxImageHeight / pngImage.height
    );
    const scaledWidth = pngImage.width * scale;
    const scaledHeight = maxImageHeight / 2;

    // Draw cell container
    currentPage.drawRectangle({
      x,
      y,
      width: cellWidth,
      height: cellHeight,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Draw product name
    currentPage.drawText(product.name, {
      x: x + textPadding,
      y: y + cellHeight - 9,
      size: 8,
      color: rgb(0, 0, 0),
      maxWidth: cellWidth - textPadding * 2,
      lineHeight: 16,
    });

    // Draw barcode image
    currentPage.drawImage(pngImage, {
      x: x + (cellWidth - scaledWidth) / 2,
      y: y + (cellHeight - scaledHeight) / 2 - 10,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Draw barcode number
    // currentPage.drawText(product.barcode!, {
    //   x: x + (cellWidth - scaledWidth) / 2,
    //   y: y + 5,
    //   size: 8,
    //   color: rgb(0.4, 0.4, 0.4),
    // });

    // Update coordinates
    x += cellWidth;
    if (x + cellWidth > width - margin) {
      x = margin;
      y -= cellHeight + verticalSpacing;

      if (y < margin) {
        currentPage = pdfDoc.addPage();
        y = height - margin - cellHeight;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const file = new File([pdfBytes], `barcodes-${randomUUID()}.pdf`, {
    type: "application/pdf",
  });

  return await uploadFile(file, false);
};
