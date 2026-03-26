import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { unauthorized } from '../errors/AppError';
import { seguidorArtistaService } from '../services/SeguidorArtistaService';

export const seguirOuDesseguir = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const perfil_artista_id = parseInt(req.params.id as string, 10);

  const resultado = await seguidorArtistaService.seguirOuDesseguir(usuario_id, perfil_artista_id);

  res.json({
    message: resultado.seguindo ? 'Artista seguido com sucesso' : 'Artista desseguido com sucesso',
    ...resultado,
  });
});

export const getPerfilPublico = asyncHandler(async (req: Request, res: Response) => {
  const perfil_artista_id = parseInt(req.params.id as string, 10);
  const authReq = req as AuthRequest;
  const usuario_id = authReq.user?.id;

  const perfil = await seguidorArtistaService.getPerfilArtistaPublico(perfil_artista_id, usuario_id);

  res.json({
    message: 'Perfil do artista encontrado com sucesso',
    perfil,
  });
});

export const getArtistasQueSigo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  if (!usuario_id) throw unauthorized('Usuário não identificado');

  const artistas = await seguidorArtistaService.getArtistasQueSigo(usuario_id);

  res.json({
    message: 'Artistas que você segue listados com sucesso',
    total: artistas.length,
    artistas,
  });
});
