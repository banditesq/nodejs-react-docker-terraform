import "dotenv/config";
import express from "express";

import user_auth from "./api/user_auth/user_auth";

import user_action from "./api/user_actions/actions";
import cors from "cors";

import { auth_middleware } from "./routes_protection/index";

import bodyParser from "body-parser";

import mongoose from "mongoose";
import http from "http";

const app = express();

const port = process.env.SERVER_PORT || 8002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin:"http://localhost:3000"}))

mongoose.connect(process.env.MONGODB_URI!);

app.use("/user_auth", user_auth);
app.use("/user", auth_middleware, user_action);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default server;
