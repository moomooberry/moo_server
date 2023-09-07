import jwt = require("jsonwebtoken");
import { CommonRequest, CommonResponse } from "../../../types/common";

const loginHandler = (req: CommonRequest, res: CommonResponse) => {
  const { id, password } = req.body;

  if (id !== process.env.CLIENT_AUTH_EMAIL) {
    res.status(401).json({
      code: 401,
      result: "Wrong Id 👀",
    });
    return;
  }

  if (password !== process.env.CLIENT_AUTH_PASSWORD) {
    res.status(401).json({
      code: 401,
      result: "Wrong Password 👀",
    });
    return;
  }

  const refreshToken = jwt.sign({ id }, process.env.TOKEN_REFRESH_SECRET_KEY, {
    expiresIn: "14d",
  });
  console.log("로그인성공 ✅ refresh token 발급 🔑");

  const accessToken = jwt.sign({ id }, process.env.TOKEN_ACCESS_SECRET_KEY, {
    expiresIn: "1h",
  });
  console.log("로그인성공 ✅ access token 발급 🔑");

  // @@@@@ 클라이언트에서는 res.cookie를 받기 위해서 withCredential 옵션을 추가해야 함
  res.cookie("you_and_my_story_refresh_token", refreshToken, {
    secure: true,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    domain: ".youandmystory.com",
    sameSite: "strict",
  });

  res.status(200).json({
    code: 200,
    result: accessToken,
  });
};

export default loginHandler;
