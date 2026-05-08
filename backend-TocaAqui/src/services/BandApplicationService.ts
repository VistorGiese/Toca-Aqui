import { Op } from 'sequelize';
import BandApplicationModel from '../models/BandApplicationModel';
import BookingModel from '../models/BookingModel';
import BandModel from '../models/BandModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import ContractModel from '../models/ContractModel';
import { createNotification } from './NotificationService';
import { NotificationType } from '../models/NotificationModel';
import { AppError } from '../errors/AppError';
import { contractService } from './ContractService';

export class BandApplicationService {
  async apply(banda_id: number | undefined, evento_id: number, requestingUserId?: number, artista_id?: number, mensagem?: string, valor_proposto?: number) {
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) throw new AppError('Evento não encontrado', 404);

    if (['aceito', 'realizado', 'cancelado'].includes(evento.status))
      throw new AppError('Evento não está aberto para novas candidaturas', 400, { status_evento: evento.status });

    const candidaturaAceita = await BandApplicationModel.findOne({ where: { evento_id, status: 'aceito' } });
    if (candidaturaAceita)
      throw new AppError('Evento já possui candidatura aceita', 400);

    let aplicacao;

    if (!banda_id) {
      // Candidatura individual de artista — valida pelo usuario_id do token
      if (!requestingUserId) throw new AppError('Usuário não identificado', 401);

      const artista = await ArtistProfileModel.findOne({ where: { usuario_id: requestingUserId } });
      if (!artista) throw new AppError('Você não possui perfil de artista', 403);

      const artistaIdResolvido = artista.id;

      const existente = await BandApplicationModel.findOne({
        where: { artista_id: artistaIdResolvido, evento_id, status: { [Op.notIn]: ['rejeitado', 'cancelado'] } },
      });
      if (existente) throw new AppError('Você já possui candidatura ativa para este evento', 400);

      aplicacao = await BandApplicationModel.create({ artista_id: artistaIdResolvido, evento_id, mensagem, valor_proposto } as any);
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

      aplicacao = await BandApplicationModel.create({ banda_id, evento_id, mensagem, valor_proposto } as any);

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
    const contrato = await contractService.generateFromApplication(aplicacao.id);

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

    // Notificar contratado aceito
    if (aplicacao.banda_id) {
      // Candidatura de banda: notificar o líder
      const liderMembro = await BandMemberModel.findOne({
        where: { banda_id: aplicacao.banda_id, e_lider: true },
      });
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
    } else if (aplicacao.artista_id) {
      // Candidatura de artista individual: notificar diretamente
      const artista = await ArtistProfileModel.findByPk(aplicacao.artista_id);
      if (artista) {
        await createNotification(
          artista.usuario_id,
          NotificationType.APLICACAO_ACEITA,
          `Sua candidatura foi aceita para o evento "${evento.titulo_evento}"!`,
          'aplicacao',
          aplicacao.id
        );
        if (contrato) {
          await createNotification(
            artista.usuario_id,
            NotificationType.CONTRATO_GERADO,
            `Um contrato foi gerado para o evento "${evento.titulo_evento}". Revise e aceite os termos.`,
            'contrato',
            contrato.id
          );
        }
      }
    }

    // Notificar líderes das bandas rejeitadas e artistas individuais rejeitados
    const rejeitadas = await BandApplicationModel.findAll({
      where: { evento_id: aplicacao.evento_id, id: { [Op.ne]: aplicacao.id }, status: 'rejeitado' },
    });
    for (const rej of rejeitadas) {
      if (rej.banda_id) {
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
      } else if (rej.artista_id) {
        const artista = await ArtistProfileModel.findByPk(rej.artista_id);
        if (artista) {
          await createNotification(
            artista.usuario_id,
            NotificationType.APLICACAO_REJEITADA,
            `Sua candidatura ao evento "${evento.titulo_evento}" foi rejeitada.`,
            'aplicacao',
            rej.id
          );
        }
      }
    }

    return { aplicacao, contrato };
  }

  async reject(applicationId: string | number) {
    const aplicacao = await BandApplicationModel.findByPk(applicationId);
    if (!aplicacao) throw new AppError('Candidatura não encontrada', 404);

    if (aplicacao.status !== 'pendente') {
      throw new AppError(`Candidatura não pode ser recusada (status atual: ${aplicacao.status})`, 400);
    }

    await aplicacao.update({ status: 'rejeitado' });

    const evento = await BookingModel.findByPk(aplicacao.evento_id);

    // Notificar artista individual
    if (aplicacao.artista_id && evento) {
      const artista = await ArtistProfileModel.findByPk(aplicacao.artista_id);
      if (artista) {
        await createNotification(
          artista.usuario_id,
          NotificationType.APLICACAO_REJEITADA,
          `Sua candidatura ao evento "${evento.titulo_evento}" foi recusada.`,
          'aplicacao',
          aplicacao.id
        );
      }
    }

    // Notificar líder de banda
    if (aplicacao.banda_id && evento) {
      const banda = await BandModel.findByPk(aplicacao.banda_id);
      const lider = await BandMemberModel.findOne({ where: { banda_id: aplicacao.banda_id, e_lider: true } });
      if (lider) {
        const artista = await ArtistProfileModel.findByPk(lider.perfil_artista_id);
        if (artista && banda) {
          await createNotification(
            artista.usuario_id,
            NotificationType.APLICACAO_REJEITADA,
            `A candidatura da sua banda "${banda.nome_banda}" ao evento "${evento.titulo_evento}" foi recusada.`,
            'aplicacao',
            aplicacao.id
          );
        }
      }
    }

    return aplicacao;
  }

  async getApplicationsForEvent(evento_id: string | number) {
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) throw new AppError('Evento não encontrado', 404);

    const aplicacoes = await BandApplicationModel.findAll({
      where: { evento_id },
      include: [
        { association: 'Band', attributes: ['id', 'nome_banda', 'descricao'] },
        { model: ArtistProfileModel, as: 'ArtistProfile', attributes: ['id', 'nome_artistico', 'foto_perfil', 'generos', 'cache_minimo', 'cache_maximo'] },
      ],
    });

    const enriched = aplicacoes.map((a: any) => ({
      id: a.id,
      evento_id: a.evento_id,
      artista_id: a.artista_id,
      banda_id: a.banda_id,
      mensagem: a.mensagem,
      status: a.status,
      data_aplicacao: a.data_aplicacao,
      nome_artista: a.ArtistProfile?.nome_artistico ?? a.Band?.nome_banda ?? null,
      foto_artista: a.ArtistProfile?.foto_perfil ?? null,
      genero: Array.isArray(a.ArtistProfile?.generos) ? a.ArtistProfile.generos[0] : null,
      cache_minimo: a.ArtistProfile?.cache_minimo ?? null,
      cache_maximo: a.ArtistProfile?.cache_maximo ?? null,
      valor_proposto: a.valor_proposto ?? null,
    }));

    const closed = evento.status === 'aceito';
    return { closed, aplicacoes: enriched };
  }

  async getApplicationsByArtist(userId: number) {
    const artista = await ArtistProfileModel.findOne({ where: { usuario_id: userId } });
    if (!artista) throw new AppError('Perfil de artista não encontrado', 404);

    const aplicacoes = await BandApplicationModel.findAll({
      where: { artista_id: artista.id },
      include: [
        {
          model: BookingModel,
          as: 'Event',
          attributes: ['id', 'titulo_evento', 'data_show', 'horario_inicio', 'horario_fim', 'perfil_estabelecimento_id'],
          include: [
            {
              model: EstablishmentProfileModel,
              as: 'EstablishmentProfile',
              attributes: ['id', 'nome_estabelecimento'],
            },
          ],
        },
      ],
      order: [['data_aplicacao', 'DESC']],
    });

    return Promise.all(aplicacoes.map(async (a: any) => {
      let contrato_id: number | null = null;
      if (a.status === 'aceito') {
        const contrato = await ContractModel.findOne({ where: { aplicacao_id: a.id }, attributes: ['id'] });
        contrato_id = contrato?.id ?? null;
      }
      return {
        id: a.id,
        status: a.status === 'rejeitado' ? 'recusado' : a.status,
        mensagem: a.mensagem,
        data_aplicacao: a.data_aplicacao,
        evento_id: a.evento_id,
        nome_evento: a.Event?.titulo_evento ?? null,
        data_show: a.Event?.data_show ?? null,
        horario_inicio: a.Event?.horario_inicio ?? null,
        horario_fim: a.Event?.horario_fim ?? null,
        nome_estabelecimento: a.Event?.EstablishmentProfile?.nome_estabelecimento ?? null,
        valor_proposto: a.valor_proposto ?? null,
        contrato_id,
      };
    }));
  }
}

export const bandApplicationService = new BandApplicationService();
