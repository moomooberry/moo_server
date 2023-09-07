import { posts } from "../../../index";
import {
  CommonRequest,
  CommonResponse,
  PaginationBody,
} from "../../../types/common";
import { IPost } from "../../../types/post";

const listHandler = (
  req: CommonRequest,
  res: CommonResponse<PaginationBody<IPost>>
) => {
  if (req.method === "GET") {
    try {
      const p = Number(req.query.p);
      const ps = Number(req.query.ps);

      const totalResults = posts.length;
      const totalPages = Math.ceil(totalResults / ps);
      const results = posts.slice((p - 1) * ps, p * ps);

      res.status(200).json({
        code: 200,
        result: {
          page: p,
          totalPages,
          totalResults,
          results,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        code: 500,
        result: "Internal Server Error ⛔️",
      });
    }
  } else {
    res.status(400).json({
      code: 400,
      result: "Wrong Request Method ❗️",
    });
  }
};

export default listHandler;
