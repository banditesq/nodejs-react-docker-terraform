import { NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.AUTH_JWT_SECRET!;

interface JWTData {
  _id: String;
}

export const encode = (
  data: JWTData,
  callback: (error: any, encoded: any) => void
) => {
  jwt.sign(
    data,
    secret,
    {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    (error, encoded) => {
      callback(error, encoded);
    }
  );
};

export const decode = (jwt_token: string) => {
  return jwt.verify(jwt_token, secret);
};

export const auth_middleware = (req: any, res: any, next: NextFunction) => {
  const bearerHeader = req.headers["authorization"];

  try {
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      const decoded = decode(bearerToken);
      req.decoded = decoded;
      next();
    } else {
      res.status(400).send("auth token not provided");
    }
  } catch (error) {
    res.status(400).json(`error verifying authentication: ${error}`);
  }
};
