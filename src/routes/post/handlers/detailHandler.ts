import { CommonRequest, CommonResponse } from "../../../types/common";
import db from "../../../libs/firebase/db";

const { getData } = db;

const detailHandler = async (req: CommonRequest, res: CommonResponse) => {
  const key = req.query.id;

  try {
    const result = await getData({ path: "post", key: key as string });
    const data = result.val();
    res.status(200).json({
      code: 200,
      result: data,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
};

export default detailHandler;
