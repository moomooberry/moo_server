import db from "../../../libs/firebase/db";
import { IPost } from "../../../types/post";
import { CommonRequest, CommonResponse } from "../../../types/common";

const { pushData } = db;

const addHandler = async (req: CommonRequest, res: CommonResponse) => {
  const data = req.body;

  try {
    await pushData<IPost>({
      path: "post",
      data: {
        title: data.title,
        author: data.author,
        category: data.category,
        created: Date.now(),
        link: data.link,
        views: 0,
        liked: 0,
        hashtags: data.hashtags ?? null,
        imgSrc: data.imgSrc ?? null,
      },
    });
    res.status(200).json({
      code: 200,
      result: "add 📚",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default addHandler;
