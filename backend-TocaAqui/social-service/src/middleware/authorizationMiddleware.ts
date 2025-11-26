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
        console.error('[RBAC] Tentativa de autorização sem autenticação prévia');
        return res.status(401).json({ 
          message: "Você precisa estar autenticado para acessar este recurso" 
        });
      }

      const userRole = req.user.role;
      if (!userRole) {
        console.error(`[RBAC] Usuário ID ${req.user.id} sem role definida`);
        return res.status(403).json({ 
          message: "Seu perfil de usuário não possui uma role atribuída" 
        });
      }

      if (!allowedRoles.includes(userRole as UserRole)) {
        console.warn(`[RBAC] Acesso negado: Usuário ID ${req.user.id} (role: ${userRole}) tentou acessar rota que requer: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ 
          error: "Acesso Negado", 
          message: `Esta ação requer uma das seguintes permissões: ${allowedRoles.join(', ')}`,
          userRole,
          requiredRoles: allowedRoles
      });
    }

    console.log(`[RBAC] Autorização concedida: Usuário ID ${req.user.id} (role: ${userRole}) acessando rota que requer: ${allowedRoles.join(', ')}`);
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
        console.error('[RBAC] Tentativa de ownership sem autenticação prévia');
        return res.status(401).json({ 
          message: "Você precisa estar autenticado para acessar este recurso" 
        });
      }

      if (req.user.role === UserRole.ADMIN) {
        console.log(`[RBAC] Admin bypass: Usuário ID ${req.user.id} (admin) tem acesso total`);
        return next();
      }

      const resourceOwnerId = await getResourceOwnerId(req);

      if (!resourceOwnerId) {
        console.warn(`[RBAC] Recurso não encontrado ou não possui dono`);
        return res.status(404).json({ 
          error: "Recurso Não Encontrado", 
          message: "O recurso solicitado não foi encontrado" 
        });
      }

      if (req.user.id !== resourceOwnerId) {
        console.warn(`[RBAC] Ownership negado: Usuário ID ${req.user.id} tentou acessar recurso de usuário ID ${resourceOwnerId}`);
        return res.status(403).json({ 
          message: "Você não tem permissão para acessar este recurso"
        });
      }

      console.log(`[RBAC] Ownership validado: Usuário ID ${req.user.id} é dono do recurso`);
      next();
    } catch (error) {
      console.error('[RBAC] Erro ao validar ownership:', error);
      return res.status(500).json({ 
        message: "Erro ao verificar permissões do recurso" 
      });
    }
  };
};
