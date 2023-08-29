import bodyParser = require("body-parser");
import express = require("express");
import jwt = require("jsonwebtoken");
import cookies = require("cookie-parser");
import cors = require("cors");
import multer = require("multer");
import db from "./db";
import s3 from "./s3";

interface IUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
}

interface Token {}

interface IPost {
  title: string;
  link: string;
  author: string;
  hashtags: string[] | null;
  imgSrc: string | null;
  views: number;
  liked: number;
  created: number;
  category: "ssul";
}

const app = express();

const PORT = 8000;

// @@@@ 이미지를 메모리에 저장하도록 하기 위한 것, 이미지를 디스크에 저장하지 않을 것
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  authExistMember,
  onValueData,
  getData,
  updateData,
  deleteData,
  viewUpData,
  likedUpData,
  pushData,
  orderData,
} = db;

const { putImageToS3, deleteImageFromS3 } = s3;

let users: IUser[] = [];
let posts: IPost[];

app.set("port", PORT);

// @@@@@ 이걸 넣어야 req.body를 파싱할 수 있음
app.use(bodyParser.json());

// @@@@@ 이걸 넣어야 req.cookies를 파싱할 수 있음
app.use(cookies());

// @@@@@ 클라이언트 도메인과 서버측 도메인이 다르기 때문에 설정해야 함 (이걸 넣어야 cors 정책 쉽게 설정 가능)
// @@@@ 아니면 res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

app.use(
  cors({
    // 모바일 확인시 localhost 직접 아이피 입력
    origin: ["http://localhost:3000", "https://www.youandmystory.com"], // 요청 허용할 도메인
    methods: "GET,POST,PUT,DELETE", // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type", "Authorization"], // 허용할 헤더
    credentials: true, // 쿠키 허용
  })
);

// AccessToken Validate Middleware (/post 뒤로오는것들 accessToken 검사)
app.use((req, res, next) => {
  if (req.url.startsWith("/post")) {
    if (
      req.path === "/post" ||
      req.path === "/post/view-up" ||
      req.path === "/post/liked-up"
    )
      return next();
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).send({
        code: 401,
        result: null,
      });
    } else {
      try {
        jwt.verify(accessToken, process.env.TOKEN_ACCESS_SECRET_KEY);
        return next();
      } catch (e) {
        return res.status(403).send({
          code: 403,
          result: null,
        });
      }
    }
  }
  next();
});

// Root
app.get("/", async (req, res) => {
  try {
    res.send("Hi, I'm moo-server👾");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

// Auth-Login (refreshToken, accessToken 발급)
app.post("/auth/login", (req, res) => {
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
    // 클라이언트 도메인으로 이거 수정필요
    domain: ".youandmystory.com",
    sameSite: "strict",
  });

  res.status(200).json({
    code: 200,
    result: accessToken,
  });
});

// Auth-AccessToken (refreshToken이 있으면 accessToken 발급)
app.get("/auth/accessToken", (req, res) => {
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
});

// Auth-Verification (refreshToken이 유효하면 true, 아닌경우 false)
app.get("/auth/verification", (req, res) => {
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
});

// Post (Pagination 처리)
app.get("/post", (req, res) => {
  if (req.method === "GET") {
    try {
      const p = Number(req.query.p);
      const ps = Number(req.query.ps);

      const totalResults = posts.length;
      const totalPages = Math.ceil(totalResults / ps);
      const results = posts.slice((p - 1) * ps, p * ps);
      res.status(200).json({
        code: 200,
        // result: posts,
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
});

// Post-ViewUp
app.post("/post/view-up", async (req, res) => {
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
});

// Post-LikedUp
app.post("/post/liked-up", async (req, res) => {
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
});

// Post-Add (accessToken 필요)
app.post("/post/add", async (req, res) => {
  const data = req.body;
  console.log("data추가", data);
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
});

// Post-Detail (accessToken 필요)
app.get("/post/detail", async (req, res) => {
  const key = req.body.id;
  try {
    const result = await getData({ path: "post", key });
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
});

// Post-Edit (accesToken 필요)
app.put("/post/edit", async (req, res) => {
  console.log("edit 불렀으");
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
});

// Post-Delete (accessToken 필요)
app.delete("/post/delete", async (req, res) => {
  const key = req.body.id;
  try {
    const origin = await getData({ path: "post", key });
    const originData = origin.val();
    if (originData.imgSrc) {
      const arr = originData.imgSrc.split("/");
      const imgKey = arr[arr.length - 1];
      await deleteImageFromS3({ Key: imgKey });
      console.log("S3 기존 이미지 삭제 ❌");
    }

    await deleteData({ path: "post", key });
    res.status(200).json({
      code: 200,
      result: "delete ❌",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: 500,
      result: "Internal Server Error ⛔️",
    });
  }
});

// @@@@@ 클라이언트 formData.append("여기",file)
// @@@@@ 서버 upload.single("여기") 일치 해야 함
// @@@@ s3 버킷 만들고 IAM 에서 getObject, putObject, deleteObject 정책 설정해야함
app.post("/image", upload.single("image"), async (req, res) => {
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
});

// SERVER 초기 세팅

app.listen(app.get("port"), async () => {
  console.log(`server 실행 ${PORT} 🚀`);

  const user = await authExistMember({
    email: process.env.FIREBASE_AUTH_EMAIL,
    password: process.env.FIREBASE_AUTH_PASSWORD,
  });
  if (user) {
    onValueData({
      path: "post",
      onValue: (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          posts = [];
          return;
        }
        const arrData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        arrData.reverse();
        console.log(`[SERVER]: post-data\n`, data);
        posts = arrData;
      },
    });
  } else {
    console.log("not exist member ⛔️");
  }
});
