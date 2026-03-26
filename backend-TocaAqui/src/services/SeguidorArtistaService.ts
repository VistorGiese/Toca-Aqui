import { Op } from 'sequelize';
import sequelize from '../config/database';
import SeguidorArtistaModel from '../models/SeguidorArtistaModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import UserModel from '../models/UserModel';
import BandMemberModel from '../models/BandMemberModel';
import BandModel from '../models/BandModel';
import BookingModel from '../models/BookingModel';
import AvaliacaoShowModel from '../models/AvaliacaoShowModel';
import { notFound } from '../errors/AppError';

class SeguidorArtistaService {
  async seguirOuDesseguir(
    usuario_id: number,
    perfil_artista_id: number
  ): Promise<{ seguindo: boolean; total_seguidores: number }> {
    const artista = await ArtistProfileModel.findByPk(perfil_artista_id);
    if (!artista) {
      throw notFound('Perfil de artista não encontrado');
    }

    const resultado = await sequelize.transaction(async (t) => {
      const seguidorExistente = await SeguidorArtistaModel.findOne({
        where: { usuario_id, perfil_artista_id },
        transaction: t,
      });

      if (seguidorExistente) {
        await seguidorExistente.destroy({ transaction: t });
        const total = await SeguidorArtistaModel.count({
          where: { perfil_artista_id },
          transaction: t,
        });
        return { seguindo: false, total_seguidores: total };
      } else {
        await SeguidorArtistaModel.create(
          { usuario_id, perfil_artista_id },
          { transaction: t }
        );
        const total = await SeguidorArtistaModel.count({
          where: { perfil_artista_id },
          transaction: t,
        });
        return { seguindo: true, total_seguidores: total };
      }
    });

    return resultado;
  }

  async isSeguindo(usuario_id: number, perfil_artista_id: number): Promise<boolean> {
    const seguidor = await SeguidorArtistaModel.findOne({
      where: { usuario_id, perfil_artista_id },
    });
    return !!seguidor;
  }

  async getSeguidores(perfil_artista_id: number): Promise<number> {
    return SeguidorArtistaModel.count({ where: { perfil_artista_id } });
  }

  async getArtistasQueSigo(usuario_id: number): Promise<any[]> {
    const seguindo = await SeguidorArtistaModel.findAll({
      where: { usuario_id },
      include: [
        {
          model: ArtistProfileModel,
          as: 'ArtistProfile',
          include: [{ model: UserModel, as: 'User', attributes: ['id', 'nome_completo'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return seguindo;
  }

  async getPerfilArtistaPublico(perfil_artista_id: number, usuario_id?: number): Promise<any> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const artista = await ArtistProfileModel.findByPk(perfil_artista_id, {
      include: [
        { model: UserModel, as: 'User', attributes: ['id', 'nome_completo'] },
        {
          model: BandMemberModel,
          as: 'BandMemberships',
          include: [{ model: BandModel, as: 'Band' }],
        },
      ],
    });

    if (!artista) {
      throw notFound('Perfil de artista não encontrado');
    }

    const [total_seguidores, avaliacoes, seguindo] = await Promise.all([
      SeguidorArtistaModel.count({ where: { perfil_artista_id } }),
      AvaliacaoShowModel.findAll({ where: {} }),
      usuario_id ? this.isSeguindo(usuario_id, perfil_artista_id) : Promise.resolve(false),
    ]);

    return {
      ...artista.toJSON(),
      total_seguidores,
      seguindo,
    };
  }
}

export const seguidorArtistaService = new SeguidorArtistaService();
