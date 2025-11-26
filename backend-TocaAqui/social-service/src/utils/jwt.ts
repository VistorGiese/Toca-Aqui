import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import type { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];


export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error('Erro ao verificar token:', err instanceof Error ? err.message : err);
    return null;
  }
};


export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (err) {
    console.error('Erro ao decodificar token:', err instanceof Error ? err.message : err);
    return null;
  }
};
