import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { unauthorized } from '../errors/AppError';
import { avaliacaoShowService } from '../services/AvaliacaoShowService';

export const criarAvaliacao = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const { agendamento_id, nota_artista, nota_local, comentario, tags_artista, tags_local } =
    req.body;

  const avaliacao = await avaliacaoShowService.criarAvaliacao({
    usuario_id,
    agendamento_id,
    nota_artista,
    nota_local,
    comentario,
    tags_artista,
    tags_local,
  });

  res.status(201).json({
    message: 'Avaliação registrada com sucesso',
    avaliacao,
  });
});

export const getAvaliacoesByShow = asyncHandler(async (req: Request, res: Response) => {
  const agendamento_id = parseInt(req.params.agendamentoId as string, 10);

  const resultado = await avaliacaoShowService.getAvaliacoesByShow(agendamento_id);

  res.json({
    message: 'Avaliações listadas com sucesso',
    ...resultado,
  });
});
