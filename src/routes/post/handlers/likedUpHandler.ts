import db from "../../../libs/firebase/db";
import { CommonRequest, CommonResponse } from "../../../types/common";

const { likedUpData } = db;

const likedUpHandler = async (req: CommonRequest, res: CommonResponse) => {
  const key = req.body.id;
  try {
    await likedUpData({ path: "post", key });
    res.status(200).json({
      code: 200,
      result: "liked up 💖",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default likedUpHandler;
