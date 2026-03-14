import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import type { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "default-secret-key";

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
