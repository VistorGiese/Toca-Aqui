import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { bandApplicationService } from '../services/BandApplicationService';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middleware/authmiddleware';

export const applyBandToEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const { banda_id, evento_id } = req.body;
  const aplicacao = await bandApplicationService.apply(banda_id, evento_id, req.user.id);
  res.status(201).json({ message: 'Banda aplicou ao evento com sucesso', aplicacao });
});

export const acceptBandApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const id = req.params.id as string;
  const aplicacao = await bandApplicationService.accept(id);
  res.json({
    message: 'Banda aceita para o evento. Evento fechado para novas candidaturas e demais candidaturas rejeitadas',
    aplicacao,
  });
});

export const getBandApplicationsForEvent = asyncHandler(async (req: Request, res: Response) => {
  const evento_id = req.params.evento_id as string;
  const result = await bandApplicationService.getApplicationsForEvent(evento_id);
  if (result.closed) {
    return res.json({ message: 'Evento fechado - já possui banda confirmada', candidaturas: [] });
  }
  res.json(result.aplicacoes);
});
