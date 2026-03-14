import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";


export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string;
    role?: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        error: "Acesso Negado",
        message: "Token de autenticação não fornecido"
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        error: "Acesso Negado",
        message: "Token de autenticação inválido"
      });
    }

    const decoded: any = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Token Inválido",
        message: "Token de autenticação inválido ou expirado"
      });
    }

    if (typeof decoded.id !== 'number' || !decoded.role) {
      return res.status(401).json({
        error: "Token Malformado",
        message: "Token com estrutura inválida"
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(401).json({
      error: "Erro de Autenticação",
      message: "Erro ao processar token de autenticação"
    });
  }
};


export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      next();
      return;
    }

    const decoded: any = verifyToken(token);

    if (decoded && typeof decoded.id === 'number' && decoded.role) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
  } catch (error) {
    // silently continue without auth
  }

  next();
};
