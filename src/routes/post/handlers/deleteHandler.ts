import { CommonRequest, CommonResponse } from "../../../types/common";
import db from "../../../libs/firebase/db";
import s3 from "../../../libs/aws/s3";

const { getData, deleteData } = db;
const { deleteImageFromS3 } = s3;

const deleteHandler = async (req: CommonRequest, res: CommonResponse) => {
  const key = req.body.id;
  console.log("delete", key);

  try {
    const origin = await getData({ path: "post", key });
    const originData = origin.val();
    if (originData.imgSrc) {
      const arr = originData.imgSrc.split("/");
      const imgKey = arr[arr.length - 1];
      await deleteImageFromS3({ Key: imgKey });
      console.log("S3 기존 이미지 삭제 ❌");
    }

    await deleteData({ path: "post", key });
    res.status(200).json({
      code: 200,
      result: "delete ❌",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default deleteHandler;
