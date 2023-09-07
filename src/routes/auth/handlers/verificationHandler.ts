import jwt = require("jsonwebtoken");
import { CommonRequest, CommonResponse } from "../../../types/common";

const verficationHandler = (req: CommonRequest, res: CommonResponse) => {
  const refreshToken = req.headers.authorization?.split(" ")[1];
  if (!refreshToken) {
    console.log("refreshToken이 없어요, verification 거짓입니다 🫥");
    return res.status(401).json({
      code: 401,
      result: false,
    });
  }
  try {
    jwt.verify(refreshToken, process.env.TOKEN_REFRESH_SECRET_KEY);
    console.log("refresh token이 유효해요, verification 참입니다 ✅");
    return res.status(200).json({
      code: 200,
      result: true,
    });
  } catch (e) {
    console.log("refreshToken이 만료됐어요, verification 거짓입니다 😳");
    return res.status(403).json({
      code: 403,
      result: false,
    });
  }
};

export default verficationHandler;
