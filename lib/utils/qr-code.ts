import QRCode from "qrcode";

export const generateQRCode = async (text: string) => {
  try {
    return await QRCode.toDataURL(text); // returns base64 image string
  } catch (err) {
    console.error(err);
    return null;
  }
};
