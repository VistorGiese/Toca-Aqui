import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { bandApplicationService } from '../services/BandApplicationService';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middleware/authmiddleware';

export const applyBandToEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const { banda_id, artista_id, evento_id, mensagem, valor_proposto } = req.body;
  const aplicacao = await bandApplicationService.apply(banda_id, evento_id, req.user.id, artista_id, mensagem, valor_proposto);
  res.status(201).json({ message: 'Candidatura enviada com sucesso', aplicacao });
});

export const acceptBandApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const id = req.params.candidaturaId as string;
  const { aplicacao, contrato } = await bandApplicationService.accept(id);
  const contratado = aplicacao.banda_id ? 'artista/banda' : 'artista';
  res.json({
    message: `Candidatura aceita. ${contratado} contratado(a) para o evento. Demais candidaturas rejeitadas.`,
    aplicacao,
    contrato,
  });
});

export const rejectBandApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const id = req.params.candidaturaId as string;
  const aplicacao = await bandApplicationService.reject(id);
  res.json({ message: 'Candidatura recusada com sucesso', aplicacao });
});

export const getBandApplicationsForEvent = asyncHandler(async (req: Request, res: Response) => {
  const evento_id = req.params.evento_id as string;
  const result = await bandApplicationService.getApplicationsForEvent(evento_id);
  if (result.closed) {
    return res.json({ closed: true, message: 'Evento fechado - candidatura já aceita', candidaturas: result.aplicacoes });
  }
  res.json(result.aplicacoes);
});

export const getMyApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
  const aplicacoes = await bandApplicationService.getApplicationsByArtist(req.user.id);
  res.json(aplicacoes);
});
