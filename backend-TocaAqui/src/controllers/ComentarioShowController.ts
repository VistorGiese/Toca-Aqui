import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { unauthorized } from '../errors/AppError';
import { comentarioShowService } from '../services/ComentarioShowService';

export const getComentarios = asyncHandler(async (req: Request, res: Response) => {
  const agendamento_id = parseInt(req.params.agendamentoId as string, 10);
  const authReq = req as AuthRequest;
  const usuario_id = authReq.user?.id;

  const comentarios = await comentarioShowService.getComentariosByShow(agendamento_id, usuario_id);

  res.json({
    message: 'Comentários listados com sucesso',
    total: comentarios.length,
    comentarios,
  });
});

export const criarComentario = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const { agendamento_id, texto, parent_id } = req.body;

  const comentario = await comentarioShowService.criarComentario({
    usuario_id,
    agendamento_id,
    texto,
    parent_id,
  });

  res.status(201).json({
    message: 'Comentário criado com sucesso',
    comentario,
  });
});

export const curtirComentario = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const comentario_id = parseInt(req.params.id as string, 10);

  const resultado = await comentarioShowService.curtirComentario(comentario_id, usuario_id);

  res.json({
    message: resultado.curtiu ? 'Comentário curtido com sucesso' : 'Curtida removida com sucesso',
    ...resultado,
  });
});
