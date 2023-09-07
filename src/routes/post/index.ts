import express = require("express");
import listHandler from "./handlers/listHandler";
import viewUpHandler from "./handlers/viewUpHandler";
import likedUpHandler from "./handlers/likedUpHandler";
import addHandler from "./handlers/addHandler";
import detailHandler from "./handlers/detailHandler";
import editHandler from "./handlers/editHandler";
import deleteHandler from "./handlers/deleteHandler";

const postRouter = express.Router();

postRouter.get("/", listHandler);

postRouter.post("/view-up", viewUpHandler);

postRouter.post("/liked-up", likedUpHandler);

postRouter.post("/add", addHandler);

postRouter.get("/detail", detailHandler);

postRouter.put("/edit", editHandler);

postRouter.delete("/delete", deleteHandler);

export default postRouter;
