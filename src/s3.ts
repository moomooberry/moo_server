import crypto = require("crypto");
import sharp = require("sharp");
import * as dotenv from "dotenv";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// dotenv-config
dotenv.config();

// initial
const s3 = new S3Client({
  region: process.env.AMAZON_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZIN_SECRET_KEY,
  },
});

interface PutImageToS3Props {
  buffer: Buffer;
  mimetype: string;
}
const putImageToS3 = async ({ buffer, mimetype }: PutImageToS3Props) => {
  // randomImageName used by crypto
  const randomImageName = crypto.randomBytes(32).toString("hex");
  // resizeImage used by sharp (contain x cover로 함)
  const resizeBuffer = await sharp(buffer)
    .resize({ width: 1920, height: 1080, fit: "cover" })
    .toBuffer();
  // s3 Bucket에 image 추가
  const putImageCommand = new PutObjectCommand({
    Bucket: process.env.AMAZON_BUCKET_NAME,
    Key: randomImageName,
    Body: resizeBuffer,
    ContentType: mimetype,
  });
  await s3.send(putImageCommand);
  // s3 Bucket 이미지 url 리턴
  return `https://${process.env.AMAZON_BUCKET_NAME}.s3.${process.env.AMAZON_BUCKET_REGION}.amazonaws.com/${randomImageName}`;
};

interface DeleteImageToS3Props {
  Key: string;
}
const deleteImageFromS3 = async ({ Key }: DeleteImageToS3Props) => {
  // s3 Bucket에 image 삭제
  const deleteImageCommand = new DeleteObjectCommand({
    Bucket: process.env.AMAZON_BUCKET_NAME,
    Key,
  });
  await s3.send(deleteImageCommand);
};

const modules = {
  putImageToS3,
  deleteImageFromS3,
};

export default modules;
