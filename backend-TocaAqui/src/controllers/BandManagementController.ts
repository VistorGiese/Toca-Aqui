/**
 * BandManagementController — Gerenciamento de bandas por artistas (rotas /gerenciamento-bandas).
 * Permite artistas criarem bandas como líderes, convidarem membros e responderem convites.
 * Para CRUD público/admin de bandas, ver BandController.
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import BandModel from '../models/BandModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import UserModel from '../models/UserModel';

export const createBand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { nome_banda, descricao, generos_musicais, perfil_artista_id } = req.body;

  if (!userId) throw new AppError('Usuário não identificado', 401);

  if (!nome_banda || !perfil_artista_id) {
    throw new AppError('Nome da banda e perfil de artista são obrigatórios', 400);
  }

  const artistProfile = await ArtistProfileModel.findOne({
    where: {
      id: perfil_artista_id,
      usuario_id: userId,
    },
  });

  if (!artistProfile) {
    throw new AppError('Perfil de artista não encontrado ou não pertence ao usuário', 404);
  }

  const band = await BandModel.create({
    nome_banda,
    descricao,
    generos_musicais: generos_musicais || [],
    esta_ativo: true,
  });

  await BandMemberModel.create({
    banda_id: band.id,
    perfil_artista_id,
    funcao: 'Líder',
    e_lider: true,
    status: 'approved',
    data_entrada: new Date(),
  });

  res.status(201).json({
    message: 'Banda criada com sucesso',
    band: {
      id: band.id,
      nome_banda: band.nome_banda,
      descricao: band.descricao,
      generos_musicais: band.generos_musicais,
      esta_ativo: band.esta_ativo,
    },
  });
});

export const getBandDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const band = await BandModel.findByPk(id as string, {
    attributes: ['id', 'nome_banda', 'descricao', 'generos_musicais', 'esta_ativo'],
    include: [
      {
        model: BandMemberModel,
        as: 'Members',
        where: { status: 'approved' },
        required: false,
        attributes: ['id', 'funcao', 'e_lider', 'data_entrada'],
        include: [
          {
            model: ArtistProfileModel,
            as: 'ArtistProfile',
            attributes: ['id', 'nome_artistico'],
            include: [
              {
                model: UserModel,
                as: 'User',
                attributes: ['nome'],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!band) throw new AppError('Banda não encontrada', 404);

  res.json({
    id: band.id,
    nome_banda: band.nome_banda,
    descricao: band.descricao,
    generos_musicais: band.generos_musicais,
    esta_ativo: band.esta_ativo,
    members: (band as any).Members?.map((member: any) => ({
      id: member.id,
      funcao: member.funcao,
      e_lider: member.e_lider,
      data_entrada: member.data_entrada,
      artist: {
        id: member.ArtistProfile.id,
        nome_artistico: member.ArtistProfile.nome_artistico,
        nome_usuario: member.ArtistProfile.User.nome,
      },
    })) || [],
  });
});

export const inviteMemberToBand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { banda_id, perfil_artista_id, funcao } = req.body;

  if (!userId) throw new AppError('Usuário não identificado', 401);

  const userLeadership = await BandMemberModel.findOne({
    where: {
      banda_id,
      e_lider: true,
      status: 'approved',
    },
    attributes: ['id'],
    include: [
      {
        model: ArtistProfileModel,
        as: 'ArtistProfile',
        where: { usuario_id: userId },
        attributes: ['id'],
      },
    ],
  });

  if (!userLeadership) {
    throw new AppError('Apenas líderes da banda podem convidar membros', 403);
  }

  const currentMembers = await BandMemberModel.count({
    where: {
      banda_id,
      status: 'approved',
    },
  });

  if (currentMembers >= 10) {
    throw new AppError('Banda já atingiu o limite máximo de 10 membros', 400);
  }

  const existingMembership = await BandMemberModel.findOne({
    where: {
      banda_id,
      perfil_artista_id,
    },
  });

  if (existingMembership) {
    throw new AppError('Artista já está na banda ou foi convidado', 400);
  }

  const invitation = await BandMemberModel.create({
    banda_id,
    perfil_artista_id,
    funcao: funcao || 'Membro',
    e_lider: false,
    status: 'pending',
  });

  res.status(201).json({
    message: 'Convite enviado com sucesso',
    invitation: {
      id: invitation.id,
      banda_id: invitation.banda_id,
      perfil_artista_id: invitation.perfil_artista_id,
      funcao: invitation.funcao,
      status: invitation.status,
    },
  });
});

export const respondToBandInvitation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { invitation_id, action } = req.body; // action: 'accept' | 'reject'

  if (!userId) throw new AppError('Usuário não identificado', 401);

  if (!['accept', 'reject'].includes(action)) {
    throw new AppError('Ação inválida. Use "accept" ou "reject"', 400);
  }

  const invitation = await BandMemberModel.findOne({
    where: {
      id: invitation_id,
      status: 'pending',
    },
    attributes: ['id', 'status', 'data_entrada'],
    include: [
      {
        model: ArtistProfileModel,
        as: 'ArtistProfile',
        where: { usuario_id: userId },
        attributes: ['id'],
      },
    ],
  });

  if (!invitation) {
    throw new AppError('Convite não encontrado ou não pertence ao usuário', 404);
  }

  if (action === 'accept') {
    invitation.status = 'approved';
    invitation.data_entrada = new Date();
  } else {
    invitation.status = 'rejected';
  }

  await invitation.save();

  res.json({
    message: action === 'accept' ? 'Convite aceito com sucesso' : 'Convite rejeitado',
    invitation: {
      id: invitation.id,
      status: invitation.status,
      data_entrada: invitation.data_entrada,
    },
  });
});

export const getUserBands = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError('Usuário não identificado', 401);

  const userArtistProfiles = await ArtistProfileModel.findAll({
    where: { usuario_id: userId },
    attributes: ['id'],
    include: [
      {
        model: BandMemberModel,
        as: 'BandMemberships',
        where: { status: 'approved' },
        required: false,
        attributes: ['id', 'funcao', 'e_lider', 'data_entrada'],
        include: [
          {
            model: BandModel,
            as: 'Band',
            attributes: ['id', 'nome_banda', 'descricao', 'generos_musicais'],
          },
        ],
      },
    ],
  });

  const bands = userArtistProfiles.flatMap((profile: any) =>
    profile.BandMemberships?.map((membership: any) => ({
      id: membership.Band.id,
      nome_banda: membership.Band.nome_banda,
      descricao: membership.Band.descricao,
      generos_musicais: membership.Band.generos_musicais,
      funcao: membership.funcao,
      e_lider: membership.e_lider,
      data_entrada: membership.data_entrada,
    })) || []
  );

  res.json({ bands });
});
