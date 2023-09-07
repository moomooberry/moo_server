import jwt = require("jsonwebtoken");
import { CommonRequest, CommonResponse } from "../../../types/common";

const accessTokenHandler = (req: CommonRequest, res: CommonResponse) => {
  const refreshToken =
    req.headers.authorization?.split(" ")[1] ??
    req.cookies.you_and_my_story_refresh_token;

  if (!refreshToken) {
    console.log("refreshToken이 없어요, accessToken을 발급 못해요 🫥");
    return res.status(401).send({
      code: 401,
      result: "refresh Token is null 🫥",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.TOKEN_REFRESH_SECRET_KEY
    );
    const accessToken = jwt.sign(
      { sub: decoded.sub },
      process.env.TOKEN_ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log("refreshToken이 유효해요, accessToken을 발급할게요 ✅");
    return res.status(200).send({
      code: 200,
      result: accessToken,
    });
  } catch (e) {
    console.log("refreshToken이 만료됐어요, accessToken을 발급 못해요 😳");
    return res.status(403).send({
      code: 403,
      result: "refresh Token is inValid 😳",
    });
  }
};

export default accessTokenHandler;
