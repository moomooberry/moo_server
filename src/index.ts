import express = require("express"); // express server
import jwt = require("jsonwebtoken"); // jwt token
import bodyParser = require("body-parser"); // req.body parsing
import cookies = require("cookie-parser"); // req.cookie parsing
import cors = require("cors"); // CORS Policy
import { cloneDeep } from "lodash";
// LIBS
import db from "./libs/firebase/db";
// ROUTER
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import imageRouter from "./routes/image";
// TYPE
import type { IPost } from "./types/post";
import { CommonCategory } from "./types/common";

const app = express();
const PORT = 8000;

const { authExistMember, onValueData } = db;

const initialPosts: Record<CommonCategory | "all", IPost[]> = {
  all: [],
  accident: [],
  animal: [],
  economy: [],
  entertainments: [],
  humor: [],
  life: [],
  politics: [],
  sports: [],
};

export let posts: Record<CommonCategory | "all", IPost[]> = initialPosts;

// APP-SETTING
app.set("port", PORT);

// APP-MIDDLEWARE
app.use(bodyParser.json());

app.use(cookies());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.youandmystory.com",
      // "http:{{아이피주소}}:3000",
    ], // 요청 허용할 도메인
    methods: "GET,POST,PUT,DELETE", // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type", "Authorization"], // 허용할 헤더
    credentials: true, // 쿠키 허용
  })
);

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

// APP-ROUTER
app.use("/auth", authRouter);

app.use("/post", postRouter);

app.use("/image", imageRouter);

// TEST-CODE
app.get("/", async (_, res) => {
  try {
    res.send("Hi, I'm moo-server👾");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

// APP-LISTENER
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
        if (!data) return;

        const arrData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        arrData.reverse();

        posts = cloneDeep(initialPosts);
        posts.all = arrData;
        arrData.forEach((item) => {
          posts[item.category as CommonCategory].push(item);
        });
        // console.log(`[SERVER]: post-data\n`, posts);
      },
    });
  } else {
    console.log("not exist member ⛔️");
  }
});
