import AvaliacaoShowModel from '../models/AvaliacaoShowModel';
import BookingModel from '../models/BookingModel';
import IngressoModel from '../models/IngressoModel';
import UserModel from '../models/UserModel';
import { badRequest, notFound } from '../errors/AppError';
import { IngressoStatus } from '../models/IngressoModel';

class AvaliacaoShowService {
  async criarAvaliacao(data: {
    usuario_id: number;
    agendamento_id: number;
    nota_artista: number;
    nota_local: number;
    comentario?: string;
    tags_artista?: string[];
    tags_local?: string[];
  }): Promise<any> {
    const show = await BookingModel.findByPk(data.agendamento_id);
    if (!show) {
      throw notFound('Show não encontrado');
    }

    const hoje = new Date();
    if (new Date(show.data_show) >= hoje) {
      throw badRequest('Só é possível avaliar shows que já aconteceram');
    }

    const ingresso = await IngressoModel.findOne({
      where: {
        usuario_id: data.usuario_id,
        agendamento_id: data.agendamento_id,
        status: IngressoStatus.CONFIRMADO,
      },
    });

    if (!ingresso) {
      throw badRequest('Você precisa ter um ingresso confirmado para avaliar este show');
    }

    const avaliacaoExistente = await AvaliacaoShowModel.findOne({
      where: {
        usuario_id: data.usuario_id,
        agendamento_id: data.agendamento_id,
      },
    });

    if (avaliacaoExistente) {
      throw badRequest('Você já avaliou este show');
    }

    const avaliacao = await AvaliacaoShowModel.create({
      usuario_id: data.usuario_id,
      agendamento_id: data.agendamento_id,
      nota_artista: data.nota_artista,
      nota_local: data.nota_local,
      comentario: data.comentario,
      tags_artista: data.tags_artista,
      tags_local: data.tags_local,
    });

    return avaliacao;
  }

  async getAvaliacoesByShow(agendamento_id: number): Promise<{
    media_artista: number;
    media_local: number;
    total: number;
    avaliacoes: any[];
  }> {
    const avaliacoes = await AvaliacaoShowModel.findAll({
      where: { agendamento_id },
      include: [
        {
          model: UserModel,
          as: 'Usuario',
          attributes: ['id', 'nome_completo'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const total = avaliacoes.length;

    if (total === 0) {
      return { media_artista: 0, media_local: 0, total: 0, avaliacoes: [] };
    }

    const somaArtista = avaliacoes.reduce((acc, a) => acc + a.nota_artista, 0);
    const somaLocal = avaliacoes.reduce((acc, a) => acc + a.nota_local, 0);

    return {
      media_artista: parseFloat((somaArtista / total).toFixed(1)),
      media_local: parseFloat((somaLocal / total).toFixed(1)),
      total,
      avaliacoes,
    };
  }
}

export const avaliacaoShowService = new AvaliacaoShowService();
