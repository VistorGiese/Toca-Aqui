import { Request, Response } from 'express';
import BandModel from '../models/BandModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import UserModel from '../models/UserModel';

export const createBand = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { nome_banda, descricao, generos_musicais, perfil_artista_id } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    if (!nome_banda || !perfil_artista_id) {
      return res.status(400).json({ error: 'Nome da banda e perfil de artista são obrigatórios' });
    }

    const artistProfile = await ArtistProfileModel.findOne({
      where: {
        id: perfil_artista_id,
        usuario_id: userId,
      },
    });

    if (!artistProfile) {
      return res.status(404).json({ error: 'Perfil de artista não encontrado ou não pertence ao usuário' });
    }

    const band = await BandModel.create({
      nome_banda,
      descricao,
      generos_musicais: JSON.stringify(generos_musicais || []),
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
        generos_musicais: JSON.parse(band.generos_musicais || '[]'),
        esta_ativo: band.esta_ativo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar banda' });
  }
};

export const getBandDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const band = await BandModel.findByPk(id, {
      include: [
        {
          model: BandMemberModel,
          as: 'Members',
          where: { status: 'approved' },
          required: false,
          include: [
            {
              model: ArtistProfileModel,
              as: 'ArtistProfile',
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

    if (!band) {
      return res.status(404).json({ error: 'Banda não encontrada' });
    }

    res.json({
      id: band.id,
      nome_banda: band.nome_banda,
      descricao: band.descricao,
      generos_musicais: JSON.parse(band.generos_musicais || '[]'),
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
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes da banda' });
  }
};

export const inviteMemberToBand = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { banda_id, perfil_artista_id, funcao } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    const userLeadership = await BandMemberModel.findOne({
      where: {
        banda_id,
        e_lider: true,
        status: 'approved',
      },
      include: [
        {
          model: ArtistProfileModel,
          as: 'ArtistProfile',
          where: { usuario_id: userId },
        },
      ],
    });

    if (!userLeadership) {
      return res.status(403).json({ error: 'Apenas líderes da banda podem convidar membros' });
    }

    const currentMembers = await BandMemberModel.count({
      where: {
        banda_id,
        status: 'approved',
      },
    });

    if (currentMembers >= 10) {
      return res.status(400).json({ error: 'Banda já atingiu o limite máximo de 10 membros' });
    }

    const existingMembership = await BandMemberModel.findOne({
      where: {
        banda_id,
        perfil_artista_id,
      },
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'Artista já está na banda ou foi convidado' });
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
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
};

export const respondToBandInvitation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { invitation_id, action } = req.body; // action: 'accept' | 'reject'

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Use "accept" ou "reject"' });
    }

    const invitation = await BandMemberModel.findOne({
      where: {
        id: invitation_id,
        status: 'pending',
      },
      include: [
        {
          model: ArtistProfileModel,
          as: 'ArtistProfile',
          where: { usuario_id: userId },
        },
      ],
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Convite não encontrado ou não pertence ao usuário' });
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
  } catch (error) {
    res.status(500).json({ error: 'Erro ao responder convite' });
  }
};

export const getUserBands = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    const userArtistProfiles = await ArtistProfileModel.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: BandMemberModel,
          as: 'BandMemberships',
          where: { status: 'approved' },
          required: false,
          include: [
            {
              model: BandModel,
              as: 'Band',
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
        generos_musicais: JSON.parse(membership.Band.generos_musicais || '[]'),
        funcao: membership.funcao,
        e_lider: membership.e_lider,
        data_entrada: membership.data_entrada,
      })) || []
    );

    res.json({ bands });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar bandas do usuário' });
  }
};