import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "../models/UserModel";
import redisService from "../config/redis";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string;
    role?: UserRole;
  };
  token?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acesso Negado, Token Inexistente" });
  }

  try {
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (typeof decoded.id !== 'number') {
      return res.status(401).json({ error: "Token com estrutura inválida" });
    }

    const isBlacklisted = await redisService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: "Token revogado. Faça login novamente." });
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};