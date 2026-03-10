import { Op } from 'sequelize';
import BandApplicationModel from '../models/BandApplicationModel';
import BookingModel from '../models/BookingModel';
import BandModel from '../models/BandModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { createNotification } from './NotificationService';
import { NotificationType } from '../models/NotificationModel';

export class BandApplicationService {
  async apply(banda_id: number, evento_id: number) {
    const banda = await BandModel.findByPk(banda_id);
    if (!banda) throw { statusCode: 404, message: 'Banda não encontrada' };
    if (!banda.esta_ativo)
      throw { statusCode: 400, message: 'Banda não está ativa e não pode aplicar para eventos' };

    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) throw { statusCode: 404, message: 'Evento não encontrado' };

    const dataEvento = new Date(evento.data_show);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataEvento < hoje)
      throw { statusCode: 400, message: 'Não é possível aplicar para evento que já ocorreu' };

    if (['aceito', 'realizado', 'cancelado'].includes(evento.status)) {
      throw {
        statusCode: 400,
        message: 'Evento não está aberto para novas candidaturas',
        extra: { status_evento: evento.status },
      };
    }

    const candidaturaAceita = await BandApplicationModel.findOne({
      where: { evento_id, status: 'aceito' },
    });
    if (candidaturaAceita)
      throw {
        statusCode: 400,
        message: 'Evento já possui banda aceita e está fechado para novas candidaturas',
      };

    const existente = await BandApplicationModel.findOne({
      where: { banda_id, evento_id, status: { [Op.notIn]: ['rejeitado', 'cancelado'] } },
    });
    if (existente) {
      throw {
        statusCode: 400,
        message: 'Banda já possui aplicação ativa para este evento',
        extra: { id: existente.id, status: existente.status, data_aplicacao: existente.data_aplicacao },
      };
    }

    const aplicacao = await BandApplicationModel.create({ banda_id, evento_id });

    const estabelecimento = await EstablishmentProfileModel.findByPk(evento.perfil_estabelecimento_id);
    if (estabelecimento) {
      await createNotification(
        estabelecimento.usuario_id,
        NotificationType.APLICACAO_RECEBIDA,
        `A banda "${banda.nome_banda}" se candidatou ao seu evento "${evento.titulo_evento}".`,
        'aplicacao',
        aplicacao.id
      );
    }

    return aplicacao;
  }

  async accept(applicationId: string | number) {
    const aplicacao = await BandApplicationModel.findByPk(applicationId);
    if (!aplicacao) throw { statusCode: 404, message: 'Candidatura não encontrada' };

    const banda = await BandModel.findByPk(aplicacao.banda_id);
    if (!banda) throw { statusCode: 404, message: 'Banda não encontrada' };
    if (!banda.esta_ativo)
      throw { statusCode: 400, message: 'Banda não está ativa e não pode ser aceita' };

    const evento = await BookingModel.findByPk(aplicacao.evento_id);
    if (!evento) throw { statusCode: 404, message: 'Evento não encontrado' };

    if (['realizado', 'cancelado'].includes(evento.status)) {
      throw {
        statusCode: 400,
        message: 'Não é possível aceitar candidatura para evento finalizado ou cancelado',
        extra: { status_evento: evento.status },
      };
    }

    const jaAprovada = await BandApplicationModel.findOne({
      where: { evento_id: aplicacao.evento_id, status: 'aceito' },
    });
    if (jaAprovada) throw { statusCode: 400, message: 'Já existe banda aceita para este evento' };

    await aplicacao.update({ status: 'aceito' });
    await BookingModel.update({ status: 'aceito' }, { where: { id: aplicacao.evento_id } });
    await BandApplicationModel.update(
      { status: 'rejeitado' },
      { where: { evento_id: aplicacao.evento_id, id: { [Op.ne]: aplicacao.id }, status: 'pendente' } }
    );

    // Notificar líder da banda aceita
    const liderMembro = await BandMemberModel.findOne({
      where: { banda_id: aplicacao.banda_id, e_lider: true },
    });
    if (liderMembro) {
      const artistaLider = await ArtistProfileModel.findByPk(liderMembro.perfil_artista_id);
      if (artistaLider) {
        await createNotification(
          artistaLider.usuario_id,
          NotificationType.APLICACAO_ACEITA,
          `Sua banda "${banda.nome_banda}" foi aceita no evento "${evento.titulo_evento}"!`,
          'aplicacao',
          aplicacao.id
        );
      }
    }

    // Notificar líderes das bandas rejeitadas
    const rejeitadas = await BandApplicationModel.findAll({
      where: { evento_id: aplicacao.evento_id, id: { [Op.ne]: aplicacao.id }, status: 'rejeitado' },
    });
    for (const rej of rejeitadas) {
      const lider = await BandMemberModel.findOne({ where: { banda_id: rej.banda_id, e_lider: true } });
      if (lider) {
        const artista = await ArtistProfileModel.findByPk(lider.perfil_artista_id);
        const bandaRej = await BandModel.findByPk(rej.banda_id);
        if (artista && bandaRej) {
          await createNotification(
            artista.usuario_id,
            NotificationType.APLICACAO_REJEITADA,
            `A candidatura da sua banda "${bandaRej.nome_banda}" ao evento "${evento.titulo_evento}" foi rejeitada.`,
            'aplicacao',
            rej.id
          );
        }
      }
    }

    return aplicacao;
  }

  async getApplicationsForEvent(evento_id: string | number) {
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) throw { statusCode: 404, message: 'Evento não encontrado' };

    if (evento.status === 'aceito') {
      return { closed: true, aplicacoes: [] };
    }

    const aplicacoes = await BandApplicationModel.findAll({
      where: { evento_id },
      include: [{ association: 'Band', attributes: ['id', 'nome_banda', 'descricao'] }],
    });

    return { closed: false, aplicacoes };
  }
}

export const bandApplicationService = new BandApplicationService();
