"use server"

import bwipjs from "bwip-js";

export const generateBarcodeBackend = async (text: string) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128", // Barcode type
      text, // Text to encode
      scale: 3, // 3x scaling factor
      height: 10, // Bar height, in mm
      includetext: true, // Show human-readable text
    });

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.error(err);
    return null;
  }
};
