import { CommonRequest, CommonResponse } from "../../../types/common";
import s3 from "../../../libs/aws/s3";

const { putImageToS3 } = s3;

const imageHandler = async (req: CommonRequest, res: CommonResponse) => {
  const file = req.file;

  if (file) {
    const buffer = file.buffer;
    const mimetype = file.mimetype;
    const imgUrl = await putImageToS3({ buffer, mimetype });
    console.log("이미지 amazon s3에 post 성공", imgUrl);
    res.status(200).json({
      code: 200,
      result: {
        imgUrl,
      },
    });
  } else {
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default imageHandler;
