import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer(); // Convert File to Buffer
  const fileName = `uploads/pos/products/${randomUUID()}-${file.name}`;
  const bucketName = process.env.AWS_BUCKET_NAME!;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  });

  await s3.send(command);

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return fileUrl;
}
