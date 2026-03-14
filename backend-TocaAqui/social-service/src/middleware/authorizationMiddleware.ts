import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";


export enum UserRole {
  ADMIN = 'admin',
  ESTABLISHMENT_OWNER = 'establishment_owner',
  ARTIST = 'artist',
  COMMON_USER = 'common_user'
}


export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Você precisa estar autenticado para acessar este recurso"
        });
      }

      const userRole = req.user.role;
      if (!userRole) {
        return res.status(403).json({
          message: "Seu perfil de usuário não possui uma role atribuída"
        });
      }

      if (!allowedRoles.includes(userRole as UserRole)) {
        return res.status(403).json({
          error: "Acesso Negado",
          message: `Esta ação requer uma das seguintes permissões: ${allowedRoles.join(', ')}`,
          userRole,
          requiredRoles: allowedRoles
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Erro no middleware de autorização:', error);
      return res.status(500).json({
        message: "Erro ao verificar permissões do usuário"
      });
    }
  };
};

export const checkAdmin = () => {
  return checkRole(UserRole.ADMIN);
};

export const checkOwnership = (
  getResourceOwnerId: (req: AuthRequest) => Promise<number | null>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Você precisa estar autenticado para acessar este recurso"
        });
      }

      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      const resourceOwnerId = await getResourceOwnerId(req);

      if (!resourceOwnerId) {
        return res.status(404).json({
          error: "Recurso Não Encontrado",
          message: "O recurso solicitado não foi encontrado"
        });
      }

      if (req.user.id !== resourceOwnerId) {
        return res.status(403).json({
          message: "Você não tem permissão para acessar este recurso"
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Erro ao validar ownership:', error);
      return res.status(500).json({
        message: "Erro ao verificar permissões do recurso"
      });
    }
  };
};
