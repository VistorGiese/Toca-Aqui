import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import {
  seguirOuDesseguir,
  getPerfilPublico,
  getArtistasQueSigo,
} from '../controllers/SeguidorArtistaController';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { Op } from 'sequelize';

const router = Router();

// GET /artistas/busca?q=nome&genero=rock
router.get('/busca', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, genero } = req.query as { q?: string; genero?: string };
    const where: any = {};
    if (q) {
      where.nome_artistico = { [Op.like]: `%${q}%` };
    }
    if (genero) {
      where.generos = { [Op.like]: `%${genero}%` };
    }
    const artistas = await ArtistProfileModel.findAll({
      where,
      limit: 20,
      attributes: ['id', 'nome_artistico', 'tipo_atuacao', 'generos', 'cache_minimo', 'cache_maximo', 'nota_media', 'shows_realizados', 'foto_perfil', 'cidade', 'estado'],
    });
    res.json(artistas);
  } catch (err) {
    next(err);
  }
});

router.get('/seguindo', authMiddleware, getArtistasQueSigo);
router.get('/:id/publico', getPerfilPublico);
router.post('/:id/seguir', authMiddleware, seguirOuDesseguir);

export default router;
