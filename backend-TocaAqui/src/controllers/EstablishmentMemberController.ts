import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import EstablishmentMemberModel from '../models/EstablishmentMemberModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import UserModel from '../models/UserModel';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';

// GET /estabelecimentos/:id/membros
export const listMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const estabelecimentoId = Number(req.params.id);

  const members = await EstablishmentMemberModel.findAll({
    where: { estabelecimento_id: estabelecimentoId },
    include: [
      {
        model: UserModel,
        as: 'User',
        attributes: ['id', 'nome_completo', 'email', 'foto_perfil'],
      },
    ],
  });

  // Busca o owner para incluir na lista
  const estabelecimento = await EstablishmentProfileModel.findByPk(estabelecimentoId, {
    include: [{ model: UserModel, as: 'User', attributes: ['id', 'nome_completo', 'email', 'foto_perfil'] }],
  });

  const owner = (estabelecimento as any)?.User;

  res.json({
    owner: owner
      ? { id: owner.id, nome_completo: owner.nome_completo, email: owner.email, foto_perfil: owner.foto_perfil, role: 'owner' }
      : null,
    members: members.map((m) => {
      const u = (m as any).User;
      return {
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        foto_perfil: u.foto_perfil,
        role: m.role,
        membro_id: m.id,
      };
    }),
  });
});

// POST /estabelecimentos/:id/membros
// Body: { email: string }
export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const estabelecimentoId = Number(req.params.id);
  const { email } = req.body;

  if (!email) throw new AppError('Email é obrigatório', 400);

  const usuario = await UserModel.findOne({ where: { email } });
  if (!usuario) throw new AppError('Usuário com este email não encontrado', 404);

  // Não pode adicionar o próprio owner como membro
  const estabelecimento = await EstablishmentProfileModel.findByPk(estabelecimentoId);
  if (!estabelecimento) throw new AppError('Estabelecimento não encontrado', 404);

  if (estabelecimento.usuario_id === usuario.id) {
    throw new AppError('O dono do estabelecimento já tem acesso total', 400);
  }

  // Verifica se já é membro
  const existing = await EstablishmentMemberModel.findOne({
    where: { estabelecimento_id: estabelecimentoId, usuario_id: usuario.id },
  });
  if (existing) throw new AppError('Este usuário já é gerenciador do estabelecimento', 409);

  const membro = await EstablishmentMemberModel.create({
    estabelecimento_id: estabelecimentoId,
    usuario_id: usuario.id,
    role: 'admin',
  });

  res.status(201).json({
    message: 'Gerenciador adicionado com sucesso',
    membro: {
      id: membro.id,
      usuario_id: usuario.id,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      role: membro.role,
    },
  });
});

// DELETE /estabelecimentos/:id/membros/:usuarioId
export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const estabelecimentoId = Number(req.params.id);
  const usuarioId = Number(req.params.usuarioId);

  const membro = await EstablishmentMemberModel.findOne({
    where: { estabelecimento_id: estabelecimentoId, usuario_id: usuarioId },
  });

  if (!membro) throw new AppError('Gerenciador não encontrado', 404);

  await membro.destroy();

  res.json({ message: 'Gerenciador removido com sucesso' });
});
