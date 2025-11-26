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
      console.warn('Tentativa de acesso sem token');
      return res.status(401).json({ 
        error: "Acesso Negado", 
        message: "Token de autenticação não fornecido" 
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      console.warn('Token vazio após processamento');
      return res.status(401).json({ 
        error: "Acesso Negado", 
        message: "Token de autenticação inválido" 
      });
    }

    const decoded: any = verifyToken(token);

    if (!decoded) {
      console.warn('Token JWT inválido ou expirado');
      return res.status(401).json({ 
        error: "Token Inválido", 
        message: "Token de autenticação inválido ou expirado" 
      });
    }

    if (!decoded.id) {
      console.error('Token JWT sem campo "id":', decoded);
      return res.status(401).json({ 
        error: "Token Malformado", 
        message: "Token não contém informações válidas do usuário" 
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    console.log(`Usuário autenticado: ID ${req.user.id} (${req.user.email || 'sem email'})`);
    
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

    if (decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      console.log(`Usuário autenticado (opcional): ID ${req.user.id}`);
    }
  } catch (error) {
    console.warn('Erro ao processar autenticação opcional (continuando sem auth):', error);
  }
  
  next();
};
