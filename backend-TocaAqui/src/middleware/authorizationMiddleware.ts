import { Response, NextFunction } from "express";
import { AuthRequest } from "./authmiddleware";
import { UserRole } from "../models/UserModel";
import { Model, ModelStatic } from "sequelize";
import AddressModel from "../models/AddressModel";
import BandModel from "../models/BandModel";
import BookingModel from "../models/BookingModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";

const modelRegistry: Record<string, ModelStatic<Model>> = {
  Address: AddressModel,
  Band: BandModel,
  Booking: BookingModel,
  EstablishmentProfile: EstablishmentProfileModel,
};


export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Não Autenticado",
          message: "Você precisa estar autenticado para acessar este recurso"
        });
      }

      const userRole = req.user.role;
      if (!userRole) {
        return res.status(403).json({
          error: "Role Não Definida",
          message: "Seu perfil de usuário não possui uma role atribuída"
        });
      }

      if (!allowedRoles.includes(userRole as UserRole)) {
        return res.status(403).json({
          error: "Acesso Negado",
          message: `Esta ação requer uma das seguintes permissões: ${allowedRoles.join(', ')}`
        });
      }

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



export const checkOwnership = (
  getResourceOwnerId: (req: AuthRequest) => Promise<number | undefined>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Não Autenticado",
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
          error: "Acesso Negado",
          message: "Você não tem permissão para acessar este recurso",
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Erro ao validar ownership:', error);
      return res.status(500).json({
        error: "Erro de Autorização",
        message: "Erro ao verificar permissões do recurso"
      });
    }
  };
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

      if (user.role === UserRole.ADMIN) {
        return next();
      }

      const Model = modelRegistry[resourceModel];
      if (!Model) {
        console.error(`Model "${resourceModel}" não registrado no modelRegistry`);
        return res.status(500).json({ error: 'Erro ao validar permissões' });
      }
      const resource = await Model.findByPk(resourceId as string);

      if (!resource) {
        return res.status(404).json({
          error: `${resourceModel} não encontrado`
        });
      }

      const ownerId = (resource as any)[ownerField];
      if (ownerId !== user.id) {
        return res.status(403).json({
          error: 'Você não tem permissão para acessar este recurso'
        });
      }

      next();
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

    if (user.role === UserRole.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  };
};
