import { CommonRequest, CommonResponse } from "../../../types/common";
import db from "../../../libs/firebase/db";
import s3 from "../../../libs/aws/s3";
import { IPost } from "../../../types/post";

const { getData, updateData } = db;
const { deleteImageFromS3 } = s3;

const editHandler = async (req: CommonRequest, res: CommonResponse) => {
  const key = req.body.id;
  const data = req.body.data;

  try {
    const origin = await getData({ path: "post", key });
    const originData = origin.val();

    if (originData.imgSrc && originData.imgSrc !== data.imgSrc) {
      const arr = originData.imgSrc.split("/");
      const imgKey = arr[arr.length - 1];
      await deleteImageFromS3({ Key: imgKey });
      console.log("S3 기존 이미지 삭제 ❌");
    }

    await updateData<IPost>({
      path: "post",
      key,
      data: {
        author: data.author,
        category: data.category,
        title: data.title,
        link: data.link,
        imgSrc: data.imgSrc ?? null,
        hashtags: data.hashtags ?? null,
        // 이건 바뀌면 안됨
        created: originData.created,
        liked: originData.liked,
        views: originData.views,
      },
    });

    res.status(200).json({
      code: 200,
      result: "edit 🛠️",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default editHandler;
