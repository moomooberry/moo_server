import db from "../../../libs/firebase/db";
import { CommonRequest, CommonResponse } from "../../../types/common";

const { viewUpData } = db;

const viewUpHandler = async (req: CommonRequest, res: CommonResponse) => {
  const key = req.body.id;

  try {
    await viewUpData({ path: "post", key });
    res.status(200).json({
      code: 200,
      result: "view up 👍",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default viewUpHandler;
