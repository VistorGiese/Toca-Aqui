import { Op } from 'sequelize';
import BandApplicationModel from '../models/BandApplicationModel';
import BookingModel from '../models/BookingModel';
import BandModel from '../models/BandModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { createNotification } from './NotificationService';
import { NotificationType } from '../models/NotificationModel';
import { AppError } from '../errors/AppError';
import { contractService } from './ContractService';

export class BandApplicationService {
  async apply(banda_id: number | undefined, evento_id: number, requestingUserId?: number, artista_id?: number, mensagem?: string) {
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) throw new AppError('Evento não encontrado', 404);

    const dataEvento = new Date(evento.data_show);
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    if (dataEvento < amanha)
      throw new AppError('Não é possível aplicar para evento que ocorrerá em menos de 1 dia', 400);

    if (['aceito', 'realizado', 'cancelado'].includes(evento.status))
      throw new AppError('Evento não está aberto para novas candidaturas', 400, { status_evento: evento.status });

    const candidaturaAceita = await BandApplicationModel.findOne({ where: { evento_id, status: 'aceito' } });
    if (candidaturaAceita)
      throw new AppError('Evento já possui candidatura aceita', 400);

    let aplicacao;

    if (artista_id && !banda_id) {
      // Candidatura individual de artista
      const existente = await BandApplicationModel.findOne({
        where: { artista_id, evento_id, status: { [Op.notIn]: ['rejeitado', 'cancelado'] } },
      });
      if (existente) throw new AppError('Você já possui candidatura ativa para este evento', 400);

      aplicacao = await BandApplicationModel.create({ artista_id, evento_id, mensagem } as any);

      const artista = await ArtistProfileModel.findByPk(artista_id);
      const estabelecimento = await EstablishmentProfileModel.findByPk(evento.perfil_estabelecimento_id);
      if (estabelecimento && artista) {
        await createNotification(
          estabelecimento.usuario_id,
          NotificationType.APLICACAO_RECEBIDA,
          `O artista "${artista.nome_artistico}" se candidatou ao seu evento "${evento.titulo_evento}".`,
          'aplicacao',
          aplicacao.id
        );
      }
    } else {
      // Candidatura de banda (fluxo existente)
      if (!banda_id) throw new AppError('banda_id é obrigatório', 400);

      const banda = await BandModel.findByPk(banda_id);
      if (!banda) throw new AppError('Banda não encontrada', 404);
      if (!banda.esta_ativo) throw new AppError('Banda não está ativa', 400);

      if (requestingUserId) {
        const membership = await BandMemberModel.findOne({
          where: { banda_id, status: 'approved' },
          include: [{ association: 'ArtistProfile', where: { usuario_id: requestingUserId }, attributes: [] }],
        });
        if (!membership) throw new AppError('Você não é membro ativo desta banda', 403);
      }

      const existente = await BandApplicationModel.findOne({
        where: { banda_id, evento_id, status: { [Op.notIn]: ['rejeitado', 'cancelado'] } },
      });
      if (existente) throw new AppError('Banda já possui aplicação ativa para este evento', 400, {
        aplicacao_existente: { id: existente.id, status: existente.status, data_aplicacao: existente.data_aplicacao },
      });

      aplicacao = await BandApplicationModel.create({ banda_id, evento_id, mensagem } as any);

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
    }

    return aplicacao;
  }

  async accept(applicationId: string | number) {
    const aplicacao = await BandApplicationModel.findByPk(applicationId);
    if (!aplicacao) throw new AppError('Candidatura não encontrada', 404);

    let banda = null;
    if (aplicacao.banda_id) {
      banda = await BandModel.findByPk(aplicacao.banda_id);
      if (!banda) throw new AppError('Banda não encontrada', 404);
      if (!banda.esta_ativo)
        throw new AppError('Banda não está ativa e não pode ser aceita', 400);
    }

    const evento = await BookingModel.findByPk(aplicacao.evento_id);
    if (!evento) throw new AppError('Evento não encontrado', 404);

    if (['realizado', 'cancelado'].includes(evento.status)) {
      throw new AppError('Não é possível aceitar candidatura para evento finalizado ou cancelado', 400, {
        status_evento: evento.status,
      });
    }

    const jaAprovada = await BandApplicationModel.findOne({
      where: { evento_id: aplicacao.evento_id, status: 'aceito' },
    });
    if (jaAprovada) throw new AppError('Já existe banda aceita para este evento', 400);

    await aplicacao.update({ status: 'aceito' });
    await BookingModel.update({ status: 'aceito' }, { where: { id: aplicacao.evento_id } });
    await BandApplicationModel.update(
      { status: 'rejeitado' },
      { where: { evento_id: aplicacao.evento_id, id: { [Op.ne]: aplicacao.id }, status: 'pendente' } }
    );

    // Gerar contrato automaticamente
    let contrato;
    try {
      contrato = await contractService.generateFromApplication(aplicacao.id);
    } catch (err) {
      console.error('[BandApplicationService] Erro ao gerar contrato:', err);
    }

    // Notificar estabelecimento sobre o contrato gerado
    if (contrato) {
      const estabelecimento = await EstablishmentProfileModel.findByPk(evento.perfil_estabelecimento_id);
      if (estabelecimento) {
        await createNotification(
          estabelecimento.usuario_id,
          NotificationType.CONTRATO_GERADO,
          `Um contrato foi gerado para o evento "${evento.titulo_evento}"${banda ? ` com a banda "${banda.nome_banda}"` : ""}. Revise e aceite os termos.`,
          'contrato',
          contrato.id
        );
      }
    }

    // Notificar líder da banda aceita (somente se for candidatura de banda)
    const liderMembro = aplicacao.banda_id ? await BandMemberModel.findOne({
      where: { banda_id: aplicacao.banda_id, e_lider: true },
    }) : null;
    if (liderMembro) {
      const artistaLider = await ArtistProfileModel.findByPk(liderMembro.perfil_artista_id);
      if (artistaLider) {
        await createNotification(
          artistaLider.usuario_id,
          NotificationType.APLICACAO_ACEITA,
          `Sua banda "${banda?.nome_banda}" foi aceita no evento "${evento.titulo_evento}"!`,
          'aplicacao',
          aplicacao.id
        );

        // Notificar sobre contrato gerado
        if (contrato) {
          await createNotification(
            artistaLider.usuario_id,
            NotificationType.CONTRATO_GERADO,
            `Um contrato foi gerado para o evento "${evento.titulo_evento}". Revise e aceite os termos.`,
            'contrato',
            contrato.id
          );
        }
      }
    }

    // Notificar líderes das bandas rejeitadas
    const rejeitadas = await BandApplicationModel.findAll({
      where: { evento_id: aplicacao.evento_id, id: { [Op.ne]: aplicacao.id }, status: 'rejeitado' },
    });
    for (const rej of rejeitadas) {
      if (!rej.banda_id) continue;
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
    if (!evento) throw new AppError('Evento não encontrado', 404);

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
