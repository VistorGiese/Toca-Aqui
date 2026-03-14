import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET!;

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error("[Social Service] JWT_SECRET não definido ou muito curto (mín. 16 caracteres). Encerrando.");
  process.exit(1);
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
