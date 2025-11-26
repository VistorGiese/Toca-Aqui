import { Response, NextFunction } from "express";
import { AuthRequest } from "./authmiddleware";
import { UserRole } from "../models/UserModel";


export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    try {
      if (!req.user) {
        console.error('[RBAC] Tentativa de autorização sem autenticação prévia');
        return res.status(401).json({ 
          error: "Não Autenticado", 
          message: "Você precisa estar autenticado para acessar este recurso" 
        });
      }

      const userRole = req.user.role;
      if (!userRole) {
        console.error(`[RBAC] Usuário ID ${req.user.id} sem role definida`);
        return res.status(403).json({ 
          error: "Role Não Definida", 
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
        error: "Erro de Autorização", 
        message: "Erro ao verificar permissões do usuário" 
      });
    }
  };
};

export const checkAdmin = () => {
  return checkRole(UserRole.ADMIN);
};


export const checkEstablishmentOwner = () => {
  return checkRole(UserRole.ADMIN, UserRole.ESTABLISHMENT_OWNER);
};


export const checkArtist = () => {
  return checkRole(UserRole.ADMIN, UserRole.ARTIST);
};


export const checkAnyRole = () => {
  return checkRole(
    UserRole.ADMIN, 
    UserRole.ESTABLISHMENT_OWNER, 
    UserRole.ARTIST, 
    UserRole.COMMON_USER
  );
};


export const checkOwnership = (
  getResourceOwnerId: (req: AuthRequest) => Promise<number | undefined>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        console.error('[RBAC] Tentativa de ownership sem autenticação prévia');
        return res.status(401).json({ 
          error: "Não Autenticado", 
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
          message: "Você não tem permissão para acessar este recurso",
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


export const getAllRoles = (): UserRole[] => {
  return Object.values(UserRole);
};


export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};


export const checkOwnershipOrAdmin = (
  resourceModel: string,
  ownerField: string = 'usuario_id'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user;
      const resourceId = req.params.id;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // ADMIN BYPASS 
      if (user.role === UserRole.ADMIN) {
        console.log(`[ADMIN BYPASS] Admin ${user.email} acessando ${resourceModel} ${resourceId}`);
        return next();
      }

      try {
        const Model = require(`../models/${resourceModel}Model`).default;
        const resource = await Model.findByPk(resourceId);

        if (!resource) {
          return res.status(404).json({ 
            error: `${resourceModel} não encontrado` 
        });
      }

      const ownerId = resource[ownerField];        if (ownerId !== user.id) {
          console.warn(`[OWNERSHIP DENIED] User ${user.id} tentou acessar ${resourceModel} ${resourceId} (owner: ${ownerId})`);
          return res.status(403).json({ 
            error: 'Você não tem permissão para acessar este recurso' 
          });
        }

        console.log(`[OWNERSHIP OK] User ${user.id} é dono de ${resourceModel} ${resourceId}`);
        next();
      } catch (modelError) {
        console.error(`Erro ao carregar model ${resourceModel}:`, modelError);
        return res.status(500).json({ 
          error: 'Erro ao validar permissões' 
        });
      }
    } catch (error) {
      console.error('Erro no middleware checkOwnershipOrAdmin:', error);
      res.status(500).json({ error: 'Erro interno ao verificar permissões' });
    }
  };
};


export const checkRolesOrAdmin = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // ADMIN BYPASS
    if (user.role === UserRole.ADMIN) {
      console.log(`[ADMIN BYPASS] Admin ${user.email} acessando rota protegida`);
      return next();
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para acessar este recurso',
        requiredRoles: allowedRoles,
        yourRole: user.role
      });
    }

    next();
  };
};
