import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const compressImage = async (file: File) => {
  const buffer = await file.arrayBuffer();

  // Use sharp to compress the image
  const compressed1 = await sharp(buffer)
    .resize({
      width: 1024, // Adjust as needed
      height: 1024, // Adjust as needed
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80, // Adjust quality (1-100)
      mozjpeg: true, // Optimize JPEG
    })
    .png({
      quality: 80, // For PNGs
      compressionLevel: 9,
    })
    .toBuffer();
  const compressedSizeMB = compressed1.length / (1024 * 1024);
  if (compressedSizeMB > 1) {
    return await sharp(compressed1)
      .resize({
        width: 800, // Adjust as needed
        height: 800, // Adjust as needed
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 60, // Adjust quality (1-100)
      })
      .png({
        quality: 60, // For PNGs
      })
      .toBuffer();
  }
  return compressed1;
};

export async function uploadFile(
  file: File,
  canCompressImage = false
): Promise<string> {
  let fileBuffer: ArrayBuffer | Buffer | null = null;
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (canCompressImage == true) {
    if (fileSizeMB > 1) fileBuffer = await compressImage(file);
    else fileBuffer = await file.arrayBuffer();
    
  } else {
    fileBuffer = await file.arrayBuffer();
  }
  const fileName = `uploads/pos/products/${randomUUID()}-${file.name}`;
  const bucketName = process.env.AWS_BUCKET_NAME!;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body:
      fileSizeMB > 1
        ? (fileBuffer as Buffer)
        : Buffer.from(fileBuffer as ArrayBuffer),
    ContentType: file.type,
  });

  await s3.send(command);

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return fileUrl;
}
