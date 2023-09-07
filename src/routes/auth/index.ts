import express = require("express");
import loginHandler from "./handlers/loginHandler";
import accessTokenHandler from "./handlers/accessTokenHandler";
import verficationHandler from "./handlers/verificationHandler";

const authRouter = express.Router();

authRouter.post("/login", loginHandler);

authRouter.get("/accessToken", accessTokenHandler);

authRouter.get("/verification", verficationHandler);

export default authRouter;
