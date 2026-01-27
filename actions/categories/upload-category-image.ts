"use server";

import { uploadFile } from "@/actions/tools/s3-bucket-uploader";

export const uploadCategoryImage = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    const fileUrl = await uploadFile(file, true);
    return { success: true, fileUrl };
  } catch (error) {
    console.error("Failed to upload category image:", error);
    return { success: false, error: "Failed to upload image" };
  }
};
