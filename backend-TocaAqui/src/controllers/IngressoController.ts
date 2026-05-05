import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { unauthorized } from '../errors/AppError';
import { ingressoService } from '../services/IngressoService';

export const comprarIngresso = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const { agendamento_id, tipo, nome_comprador, cpf, telefone } = req.body;

  const ingresso = await ingressoService.comprarIngresso({
    usuario_id,
    agendamento_id,
    tipo,
    nome_comprador,
    cpf,
    telefone,
  });

  res.status(201).json({
    message: 'Ingresso comprado com sucesso',
    ingresso,
  });
});

export const getMeusIngressos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const { tipo } = req.query as Record<string, string>;

  const ingressos = await ingressoService.getMeusIngressos(
    usuario_id,
    tipo as 'proximos' | 'passados' | undefined
  );

  res.json({
    message: 'Ingressos listados com sucesso',
    total: ingressos.length,
    ingressos,
  });
});

export const getIngressoById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const id = parseInt(req.params.id as string, 10);

  const ingresso = await ingressoService.getIngressoById(id, usuario_id);

  res.json({
    message: 'Ingresso encontrado com sucesso',
    ingresso,
  });
});
