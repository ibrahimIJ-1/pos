import JsBarcode from "jsbarcode";
import { RefObject, useRef } from "react";
export const generateBarcodeFrontEnd = (text: string) => {
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
    });

    const base64 = canvas.toDataURL("image/png");
    return base64
  } catch (err) {
    console.error(err);
    return null;
  }
};
