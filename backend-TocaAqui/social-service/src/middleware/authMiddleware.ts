import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import redisService from "../config/redis";


export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string;
    role?: string;
  };
  token?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "Acesso Negado, Token Inexistente" });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "Token de autenticação inválido" });
    }

    const decoded: any = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (typeof decoded.id !== 'number' || !decoded.role) {
      return res.status(401).json({ error: "Token com estrutura inválida" });
    }

    const isBlacklisted = await redisService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: "Token revogado. Faça login novamente." });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
