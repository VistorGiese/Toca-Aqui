import sequelize from '../config/database';
import ComentarioShowModel from '../models/ComentarioShowModel';
import CurtidaComentarioModel from '../models/CurtidaComentarioModel';
import UserModel from '../models/UserModel';
import { badRequest, notFound } from '../errors/AppError';

class ComentarioShowService {
  async getComentariosByShow(agendamento_id: number, usuario_id?: number): Promise<any[]> {
    const comentarios = await ComentarioShowModel.findAll({
      where: { agendamento_id, parent_id: null },
      include: [
        {
          model: UserModel,
          as: 'Usuario',
          attributes: ['id', 'nome_completo'],
        },
        {
          model: ComentarioShowModel,
          as: 'Respostas',
          include: [
            {
              model: UserModel,
              as: 'Usuario',
              attributes: ['id', 'nome_completo'],
            },
          ],
          order: [['created_at', 'ASC']],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    if (!usuario_id) {
      return comentarios.map((c) => ({ ...c.toJSON(), curtiu: false }));
    }

    const comentarioIds = comentarios.map((c) => c.id);
    const curtidas = await CurtidaComentarioModel.findAll({
      where: { usuario_id, comentario_id: comentarioIds },
    });

    const curtidasSet = new Set(curtidas.map((c) => c.comentario_id));

    return comentarios.map((c) => ({
      ...c.toJSON(),
      curtiu: curtidasSet.has(c.id),
    }));
  }

  async criarComentario(data: {
    usuario_id: number;
    agendamento_id: number;
    texto: string;
    parent_id?: number;
  }): Promise<any> {
    if (data.parent_id) {
      const pai = await ComentarioShowModel.findOne({
        where: { id: data.parent_id, agendamento_id: data.agendamento_id },
      });

      if (!pai) {
        throw notFound('Comentário pai não encontrado');
      }

      if (pai.parent_id) {
        throw badRequest('Não é possível responder a uma resposta');
      }
    }

    const comentario = await ComentarioShowModel.create({
      usuario_id: data.usuario_id,
      agendamento_id: data.agendamento_id,
      texto: data.texto,
      parent_id: data.parent_id,
      curtidas_count: 0,
    });

    const comentarioComUsuario = await ComentarioShowModel.findByPk(comentario.id, {
      include: [
        {
          model: UserModel,
          as: 'Usuario',
          attributes: ['id', 'nome_completo'],
        },
      ],
    });

    return comentarioComUsuario;
  }

  async curtirComentario(
    comentario_id: number,
    usuario_id: number
  ): Promise<{ curtiu: boolean; curtidas_count: number }> {
    const comentario = await ComentarioShowModel.findByPk(comentario_id);
    if (!comentario) {
      throw notFound('Comentário não encontrado');
    }

    const resultado = await sequelize.transaction(async (t) => {
      const curtidaExistente = await CurtidaComentarioModel.findOne({
        where: { usuario_id, comentario_id },
        transaction: t,
      });

      if (curtidaExistente) {
        await curtidaExistente.destroy({ transaction: t });
        const novoCount = Math.max(0, comentario.curtidas_count - 1);
        await comentario.update({ curtidas_count: novoCount }, { transaction: t });
        return { curtiu: false, curtidas_count: novoCount };
      } else {
        await CurtidaComentarioModel.create(
          { usuario_id, comentario_id },
          { transaction: t }
        );
        const novoCount = comentario.curtidas_count + 1;
        await comentario.update({ curtidas_count: novoCount }, { transaction: t });
        return { curtiu: true, curtidas_count: novoCount };
      }
    });

    return resultado;
  }
}

export const comentarioShowService = new ComentarioShowService();
