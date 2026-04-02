import { Response } from 'express';
import { contractService } from '../services/ContractService';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middleware/authmiddleware';
import { createNotification } from '../services/NotificationService';
import { NotificationType } from '../models/NotificationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import redisService from '../config/redis';
import { CACHE_KEYS } from '../config/cache';
import ContractModel from '../models/ContractModel';
import AvaliacaoShowModel from '../models/AvaliacaoShowModel';
import ArtistProfileModel from '../models/ArtistProfileModel';

export const getContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  const contrato = await contractService.getById(contractId);
  res.json(contrato);
});

export const getContractByEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const eventoId = parseInt(req.params.evento_id as string);
  const contrato = await contractService.getByEvent(eventoId);
  if (!contrato) throw new AppError('Nenhum contrato encontrado para este evento', 404);

  const role = await contractService.getUserRole(contrato.id, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  res.json(contrato);
});

export const getMyContracts = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contratos = await contractService.getByUser(req.user.id);
  res.json({ data: contratos });
});

export const editContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  const contrato = await contractService.proposeEdit(contractId, req.user.id, role, req.body);

  // Notificar a outra parte sobre a edição
  const outraParte = role === 'contratante' ? 'contratado' : 'contratante';
  const outroUserId = await getOtherPartyUserId(contrato, outraParte);
  if (outroUserId) {
    await createNotification(
      outroUserId,
      NotificationType.CONTRATO_ATUALIZADO,
      `O contrato para o evento foi atualizado pelo ${role}. Revise as alterações.`,
      'contrato',
      contrato.id
    );
  }

  await redisService.invalidatePattern('contratos:*');
  res.json(contrato);
});

export const acceptContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  const contrato = await contractService.acceptContract(contractId, req.user.id, role);

  // Se ambos aceitaram, notificar ambas as partes
  if (contrato.aceite_contratante && contrato.aceite_contratado) {
    const estabUserId = await getOtherPartyUserId(contrato, 'contratante');
    const bandUserId = await getOtherPartyUserId(contrato, 'contratado');

    const msg = `O contrato para o evento foi aceito por ambas as partes! O contrato está em vigor.`;
    if (estabUserId) {
      await createNotification(estabUserId, NotificationType.CONTRATO_ACEITO, msg, 'contrato', contrato.id);
    }
    if (bandUserId) {
      await createNotification(bandUserId, NotificationType.CONTRATO_ACEITO, msg, 'contrato', contrato.id);
    }
  } else {
    // Notificar a outra parte que esta parte aceitou
    const outraParte = role === 'contratante' ? 'contratado' : 'contratante';
    const outroUserId = await getOtherPartyUserId(contrato, outraParte);
    if (outroUserId) {
      await createNotification(
        outroUserId,
        NotificationType.CONTRATO_ATUALIZADO,
        `O ${role} aceitou o contrato. Aguardando seu aceite.`,
        'contrato',
        contrato.id
      );
    }
  }

  await redisService.invalidatePattern('contratos:*');
  res.json(contrato);
});

export const cancelContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  const { contrato, penalidade_percentual } = await contractService.cancelContract(
    contractId, req.user.id, role, req.body.motivo
  );

  // Notificar a outra parte
  const outraParte = role === 'contratante' ? 'contratado' : 'contratante';
  const outroUserId = await getOtherPartyUserId(contrato, outraParte);
  if (outroUserId) {
    await createNotification(
      outroUserId,
      NotificationType.CONTRATO_CANCELADO,
      `O contrato foi cancelado pelo ${role}. Motivo: ${req.body.motivo}`,
      'contrato',
      contrato.id
    );
  }

  await redisService.invalidatePattern('contratos:*');
  res.json({ contrato, penalidade_percentual });
});

export const getContractHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (!role) throw new AppError('Você não tem acesso a este contrato', 403);

  const historico = await contractService.getHistory(contractId);
  res.json({ data: historico });
});

// Helper para obter o userId da outra parte do contrato
async function getOtherPartyUserId(
  contrato: { perfil_estabelecimento_id: number; banda_id?: number; artista_id?: number },
  targetRole: 'contratante' | 'contratado'
): Promise<number | null> {
  if (targetRole === 'contratante') {
    const estab = await EstablishmentProfileModel.findByPk(contrato.perfil_estabelecimento_id);
    return estab?.usuario_id ?? null;
  } else {
    // Artista individual
    if (contrato.artista_id) {
      const artista = await ArtistProfileModel.findByPk(contrato.artista_id);
      return artista?.usuario_id ?? null;
    }
    // Banda — retorna userId do líder
    if (contrato.banda_id) {
      const lider = await BandMemberModel.findOne({
        where: { banda_id: contrato.banda_id, e_lider: true },
        include: [{ association: 'ArtistProfile', attributes: ['usuario_id'] }],
      });
      return (lider as any)?.ArtistProfile?.usuario_id ?? null;
    }
    return null;
  }
}

export const completeContractHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuario nao identificado', 401);
  const contractId = parseInt(req.params.id as string);
  const role = await contractService.getUserRole(contractId, req.user.id);
  if (role !== 'contratante') throw new AppError('Apenas o contratante pode concluir o contrato', 403);
  const contrato = await contractService.completeContract(contractId);
  await redisService.invalidatePattern('contratos:*');
  res.json(contrato);
});

export const avaliarEstabelecimento = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw new AppError('Usuário não identificado', 401);

  const contrato_id = parseInt(req.params.id as string);
  const { nota, comentario, tags } = req.body;

  if (!nota || nota < 1 || nota > 5) {
    throw new AppError('Nota deve ser entre 1 e 5', 400);
  }

  const contract = await ContractModel.findByPk(contrato_id);
  if (!contract) throw new AppError('Contrato não encontrado', 404);
  if (contract.status !== 'concluido') throw new AppError('Só é possível avaliar contratos concluídos', 400);

  // Verifica se o usuário é o contratado (artista individual ou líder de banda)
  let contratadoUserId: number | null = null;
  if (contract.artista_id) {
    const artista = await ArtistProfileModel.findByPk(contract.artista_id);
    contratadoUserId = artista?.usuario_id ?? null;
  } else if (contract.banda_id) {
    const lider = await BandMemberModel.findOne({
      where: { banda_id: contract.banda_id, e_lider: true },
      include: [{ association: 'ArtistProfile', attributes: ['usuario_id'] }],
    });
    contratadoUserId = (lider as any)?.ArtistProfile?.usuario_id ?? null;
  }
  if (contratadoUserId !== usuario_id) throw new AppError('Acesso negado', 403);

  const existing = await AvaliacaoShowModel.findOne({
    where: { usuario_id, agendamento_id: contract.evento_id },
  });
  if (existing) throw new AppError('Você já avaliou este contrato', 400);

  const avaliacao = await AvaliacaoShowModel.create({
    usuario_id,
    agendamento_id: contract.evento_id,
    nota_artista: nota,
    nota_local: nota,
    comentario: comentario || null,
    tags_local: tags || [],
    tags_artista: [],
  });

  res.status(201).json({ message: 'Avaliação registrada com sucesso', avaliacao });
});

export const avaliarArtista = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw new AppError('Usuario nao identificado', 401);

  const contrato_id = parseInt(req.params.id as string);
  const { nota, comentario, tags } = req.body;

  if (!nota || nota < 1 || nota > 5) {
    throw new AppError('Nota deve ser entre 1 e 5', 400);
  }

  const contract = await ContractModel.findByPk(contrato_id);
  if (!contract) throw new AppError('Contrato nao encontrado', 404);
  if (contract.status !== 'concluido') throw new AppError('So e possivel avaliar contratos concluidos', 400);

  // Verify caller is the contratante (establishment owner)
  const estab = await EstablishmentProfileModel.findByPk(contract.perfil_estabelecimento_id);
  if (!estab || estab.usuario_id !== usuario_id) throw new AppError('Acesso negado', 403);

  // Check for duplicate rating
  const existing = await AvaliacaoShowModel.findOne({
    where: { usuario_id, agendamento_id: contract.evento_id },
  });
  if (existing) throw new AppError('Voce ja avaliou este artista', 400);

  // Create evaluation record
  const avaliacao = await AvaliacaoShowModel.create({
    usuario_id,
    agendamento_id: contract.evento_id,
    nota_artista: nota,
    nota_local: nota,
    comentario: comentario || null,
    tags_artista: tags || [],
    tags_local: [],
  });

  // Recalculate nota_media for the artist
  const artistId = contract.artista_id;
  if (artistId) {
    const artistContracts = await ContractModel.findAll({
      where: { artista_id: artistId, status: 'concluido' },
      attributes: ['evento_id'],
    });
    const eventoIds = artistContracts.map((c: any) => c.evento_id);

    if (eventoIds.length > 0) {
      const avaliacoes = await AvaliacaoShowModel.findAll({
        where: { agendamento_id: eventoIds },
        attributes: ['nota_artista'],
      });
      if (avaliacoes.length > 0) {
        const avg = avaliacoes.reduce((sum: number, a: any) => sum + a.nota_artista, 0) / avaliacoes.length;
        await ArtistProfileModel.update(
          { nota_media: Math.round(avg * 10) / 10 },
          { where: { id: artistId } }
        );
      }
    }
  }

  res.status(201).json({ message: 'Avaliacao registrada com sucesso', avaliacao });
});
