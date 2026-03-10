import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

const JWT_SECRET: Secret = env.JWT_SECRET;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export const generateToken = (payload: string | object | Buffer) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
