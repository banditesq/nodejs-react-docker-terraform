import server from "../index";

import request from "supertest";
import { decode } from "../routes_protection";
const emails = require("email-generator");
const email = emails.generateEmail();
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

describe("Post Endpoints", () => {
  describe("Create User Endpoint", () => {
    it("should fail because email was not provided", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        first_name: "hi",
        last_name: "there",
        password: "hithere",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        "error creating user: ValidationError: email: Path `email` is required."
      );
    });

    it("should fail because firstname was not provided", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        email: "hi@there.com",
        last_name: "there",
        password: "hithere",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        "error creating user: ValidationError: first_name: Path `first_name` is required."
      );
    });
    it("should fail because last_name was not provided", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        email: "hi@there.com",
        first_name: "hi",
        password: "hithere",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        "error creating user: ValidationError: last_name: Path `last_name` is required."
      );
    });
    it("should fail because password was not provided", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        email: "hi@there.com",
        first_name: "hi",
        last_name: "there",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        "error creating user: TypeError: Cannot read properties of undefined (reading 'toString')"
      );
    });
    it("should create user", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        email,
        first_name: "hi",
        last_name: "there",
        password: "hithere",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.text).toBe('"user saved"');
    }, 10000);
    it("should fail because user already exists", async () => {
      const res = await request(server).post("/user_auth/signup").send({
        email,
        first_name: "hi",
        last_name: "there",
        password: "hithere",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        `error creating user: MongoServerError: E11000 duplicate key error collection: test.users index: email_1 dup key: { email: \"${email}\" }`
      );
    }, 10000);
  });
  describe("Login Endpoint", () => {
    it("should fail: email not provided", async () => {
      const res = await request(server).post("/user_auth/login").send({
        password: "jhfhhf",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("error finding user: null");
    });
    it("should fail: password not provided", async () => {
      const res = await request(server).post("/user_auth/login").send({
        email: "jhfhh@email.comf",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("error finding user: null");
    });
    it("should fail: incorrect password", async () => {
      const res = await request(server).post("/user_auth/login").send({
        email,
        password: "hitherrrr",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("error finding user: invalid password");
    });
    it("should succeed: login and decode jwt", async () => {
      const res = await request(server).post("/user_auth/login").send({
        email,
        password: "hithere",
      });

      expect(res.statusCode).toEqual(200);
      expect(decode(JSON.parse(res.text).auth_token)).toEqual(
        expect.objectContaining({ _id: expect.any(String) })
      );
    });
  });
});

describe("GET Endpoints", () => {
  describe("GET User details", () => {
    it("should succeed", async () => {
      const login_res = await request(server).post("/user_auth/login").send({
        email,
        password: "hithere",
      });
      const get_details_res = await request(server)
        .get("/user/details")
        .set({
          Authorization: `Bearer ${JSON.parse(login_res.text).auth_token}`,
        });
      expect(get_details_res.statusCode).toEqual(200);
    });
    it("shoud fail: auth token not provided", async () => {
      const res = await request(server).get("/user/details");
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("auth token not provided");
    });

    it("shoud fail: wrong signature", async () => {
      let token = jwt.sign({}, "dummy");
      const res = await request(server)
        .get("/user/details")
        .set({ Authorization: `Bearer ${token}` });
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        '"error verifying authentication: JsonWebTokenError: invalid signature"'
      );
    });

    it("shoud fail: invalid user", async () => {
      let token = jwt.sign(
        {
          _id: new mongoose.Types.ObjectId(),
        },
        process.env.AUTH_JWT_SECRET ?? ""
      );
      const res = await request(server)
        .get("/user/details")
        .set({ Authorization: `Bearer ${token}` });
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("could not get user: user not found");
    });
    it("shoud fail: token expired", async () => {
      let token = jwt.sign(
        {
          _id: new mongoose.Types.ObjectId(),
          exp: 1,
        },
        process.env.AUTH_JWT_SECRET ?? ""
      );
      const res = await request(server)
        .get("/user/details")
        .set({ Authorization: `Bearer ${token}` });
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe(
        '"error verifying authentication: TokenExpiredError: jwt expired"'
      );
    });
  });
});
