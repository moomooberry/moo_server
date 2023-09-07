/**
 * @read s3 버킷, IAM에서 getObject, putObject, deleteObject 정책 설정
 */
import express = require("express");
import multer = require("multer");
import imageHandler from "./handlers/imageHandler";

// 이미지 메모리 저장, 디스크 저장 x
const storage = multer.memoryStorage();
const upload = multer({ storage });

const imageRouter = express.Router();
// single("이름") client input name="이름" 일치해야함
imageRouter.post("/", upload.single("image"), imageHandler);

export default imageRouter;
