import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { showService } from '../services/ShowService';

export const getPublicShows = asyncHandler(async (req: Request, res: Response) => {
  const {
    cidade,
    genero,
    data_inicio,
    data_fim,
    esta_semana,
    fim_de_semana,
    esta_hoje,
    page,
    limit,
  } = req.query as Record<string, string>;

  const resultado = await showService.getPublicShows({
    cidade,
    genero,
    data_inicio,
    data_fim,
    esta_semana: esta_semana === 'true',
    fim_de_semana: fim_de_semana === 'true',
    esta_hoje: esta_hoje === 'true',
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    message: 'Shows listados com sucesso',
    ...resultado,
  });
});

export const getShowById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const authReq = req as AuthRequest;
  const usuario_id = authReq.user?.id;

  const show = await showService.getShowById(id, usuario_id);

  res.json({
    message: 'Show encontrado com sucesso',
    show,
  });
});

export const getShowsDestaque = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query as Record<string, string>;

  const shows = await showService.getShowsDestaque(limit ? parseInt(limit, 10) : undefined);

  res.json({
    message: 'Shows em destaque listados com sucesso',
    shows,
  });
});

export const searchShows = asyncHandler(async (req: Request, res: Response) => {
  const { q, tipo } = req.query as Record<string, string>;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Parâmetro de busca obrigatório' });
  }

  const resultado = await showService.searchShows(
    q.trim(),
    tipo as 'shows' | 'artistas' | 'locais' | undefined
  );

  res.json({
    message: 'Busca realizada com sucesso',
    ...resultado,
  });
});
