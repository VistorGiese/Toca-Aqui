import { Op } from 'sequelize';
import ContractModel, { ContractStatus, PaymentMethod } from '../models/ContractModel';
import ContractHistoryModel from '../models/ContractHistoryModel';
import BandApplicationModel from '../models/BandApplicationModel';
import BookingModel from '../models/BookingModel';
import BandModel from '../models/BandModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import PaymentModel from '../models/PaymentModel';
import { AppError } from '../errors/AppError';

// Campos que podem ser editados por ambas as partes
const EDITABLE_FIELDS = [
  'cache_total', 'percentual_sinal', 'metodo_pagamento',
  'data_pagamento_sinal', 'data_pagamento_restante',
  'obrigacoes_contratante', 'obrigacoes_contratado',
  'penalidade_cancelamento_72h', 'penalidade_cancelamento_24_72h',
  'penalidade_cancelamento_24h', 'direitos_imagem',
  'infraestrutura_som', 'infraestrutura_backline',
  'intervalos', 'observacoes', 'genero_musical',
] as const;

type EditableField = typeof EDITABLE_FIELDS[number];

export class ContractService {
  /**
   * Gera contrato automaticamente a partir de uma candidatura aceita.
   * Faz snapshot dos dados de ambas as partes no momento da criação.
   */
  async generateFromApplication(aplicacaoId: number): Promise<ContractModel> {
    const aplicacao = await BandApplicationModel.findByPk(aplicacaoId);
    if (!aplicacao) throw new AppError('Candidatura não encontrada', 404);

    // Verificar se já existe contrato para esta aplicação
    const existente = await ContractModel.findOne({ where: { aplicacao_id: aplicacaoId } });
    if (existente) throw new AppError('Já existe contrato para esta candidatura', 400);

    // Carregar evento
    const evento = await BookingModel.findByPk(aplicacao.evento_id);
    if (!evento) throw new AppError('Evento não encontrado', 404);

    // Carregar estabelecimento + endereço
    const estabelecimento = await EstablishmentProfileModel.findByPk(evento.perfil_estabelecimento_id);
    if (!estabelecimento) throw new AppError('Estabelecimento não encontrado', 404);

    const endereco = await AddressModel.findByPk(estabelecimento.endereco_id);

    // Carregar contratado — pode ser banda ou artista individual
    if (!aplicacao.banda_id && !aplicacao.artista_id) {
      throw new AppError('Candidatura inválida: sem artista ou banda associada', 400);
    }

    let nomeContratado = 'Artista';
    let telefoneContratado: string | undefined;
    let generoContratado: string | undefined;
    let contratadoId: { banda_id?: number; artista_id?: number } = {};

    if (aplicacao.banda_id) {
      const banda = await BandModel.findByPk(aplicacao.banda_id);
      if (!banda) throw new AppError('Banda não encontrada', 404);
      nomeContratado = banda.nome_banda ?? 'Artista';
      telefoneContratado = banda.telefone_contato ?? undefined;
      const generos: string[] = Array.isArray(banda.generos_musicais) ? banda.generos_musicais : [];
      generoContratado = generos[0] ?? undefined;
      contratadoId = { banda_id: aplicacao.banda_id };
    } else if (aplicacao.artista_id) {
      const artista = await ArtistProfileModel.findByPk(aplicacao.artista_id);
      if (!artista) throw new AppError('Artista não encontrado', 404);
      nomeContratado = artista.nome_artistico;
      const generos: any[] = Array.isArray(artista.generos) ? artista.generos : [];
      generoContratado = generos[0] ?? undefined;
      contratadoId = { artista_id: aplicacao.artista_id };
    }

    // Montar endereço completo como string
    const enderecoStr = endereco
      ? `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP ${endereco.cep}`
      : '';

    // Calcular duração em minutos
    const [hInicio, mInicio] = evento.horario_inicio.split(':').map(Number);
    const [hFim, mFim] = evento.horario_fim.split(':').map(Number);
    let duracao = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
    if (duracao < 0) duracao += 24 * 60; // Evento que passa da meia-noite

    // Criar contrato com valores padrão do mini-contrato
    const contrato = await ContractModel.create({
      aplicacao_id: aplicacaoId,
      evento_id: evento.id,
      ...contratadoId,
      perfil_estabelecimento_id: evento.perfil_estabelecimento_id,
      status: ContractStatus.AGUARDANDO_ACEITE,
      // Snapshot contratante
      nome_contratante: estabelecimento.nome_estabelecimento,
      endereco_contratante: enderecoStr,
      telefone_contratante: estabelecimento.telefone_contato,
      // Snapshot contratado
      nome_contratado: nomeContratado,
      telefone_contratado: telefoneContratado,
      // Evento
      data_evento: evento.data_show,
      horario_inicio: evento.horario_inicio,
      horario_fim: evento.horario_fim,
      duracao_minutos: duracao,
      genero_musical: generoContratado ?? estabelecimento.generos_musicais?.split(',')[0].trim() ?? null,
      local_evento: `${estabelecimento.nome_estabelecimento} - ${enderecoStr}`,
      // Cachê — semeado a partir do valor proposto pelo artista
      cache_total: aplicacao.valor_proposto ?? 0,
      percentual_sinal: 50.00,
      valor_sinal: Math.round(((aplicacao.valor_proposto ?? 0) * 50) / 100 * 100) / 100,
      // Penalidades padrão conforme mini-contrato
      penalidade_cancelamento_72h: 0,
      penalidade_cancelamento_24_72h: 50,
      penalidade_cancelamento_24h: 100,
      // Direitos
      direitos_imagem: true,
      // Aceite
      aceite_contratante: false,
      aceite_contratado: false,
      metodo_pagamento: PaymentMethod.STRIPE,
      versao: 1,
    });

    return contrato;
  }

  async getById(contractId: number): Promise<ContractModel> {
    const contrato = await ContractModel.findByPk(contractId, {
      include: [
        { association: 'Event' },
        { association: 'Band' },
        { association: 'EstablishmentProfile' },
        { association: 'Payments' },
      ],
    });
    if (!contrato) throw new AppError('Contrato não encontrado', 404);
    return contrato;
  }

  async getByEvent(eventoId: number): Promise<ContractModel | null> {
    return ContractModel.findOne({
      where: { evento_id: eventoId },
      include: [
        { association: 'Band' },
        { association: 'EstablishmentProfile' },
        { association: 'Payments' },
      ],
    });
  }

  async getByUser(userId: number): Promise<ContractModel[]> {
    // Buscar contratos onde o usuário é dono do estabelecimento
    const estabelecimentos = await EstablishmentProfileModel.findAll({
      where: { usuario_id: userId },
      attributes: ['id'],
    });
    const estabIds = estabelecimentos.map(e => e.id);

    // Buscar contratos onde o usuário é líder de banda
    const membros = await BandMemberModel.findAll({
      where: { e_lider: true },
      include: [{
        association: 'ArtistProfile',
        where: { usuario_id: userId },
        attributes: [],
      }],
      attributes: ['banda_id'],
    });
    const bandaIds = membros.map(m => m.banda_id);

    // Buscar contratos onde o usuário é artista individual
    const perfilArtista = await ArtistProfileModel.findOne({
      where: { usuario_id: userId },
      attributes: ['id'],
    });
    const artistaId = perfilArtista?.id;

    const orConditions = [
      ...(estabIds.length ? [{ perfil_estabelecimento_id: { [Op.in]: estabIds } }] : []),
      ...(bandaIds.length ? [{ banda_id: { [Op.in]: bandaIds } }] : []),
      ...(artistaId ? [{ artista_id: artistaId }] : []),
    ];

    if (!orConditions.length) return [];

    return ContractModel.findAll({
      where: { [Op.or]: orConditions },
      include: [
        { association: 'Event' },
        { association: 'Band' },
        { association: 'EstablishmentProfile' },
        { association: 'ArtistProfile' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Propõe edição no contrato. Ambas as partes podem editar campos permitidos.
   * Toda edição reseta os aceites e registra histórico.
   */
  async proposeEdit(
    contractId: number,
    userId: number,
    role: 'contratante' | 'contratado',
    changes: Partial<Record<EditableField, unknown>>,
  ): Promise<ContractModel> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    if (![ContractStatus.RASCUNHO, ContractStatus.AGUARDANDO_ACEITE].includes(contrato.status)) {
      throw new AppError('Contrato não pode ser editado neste status', 400);
    }

    // Filtrar apenas campos editáveis
    const validChanges: Record<string, unknown> = {};
    const historyEntries: Omit<ContractHistoryModel, keyof import('sequelize').Model>[] = [];

    for (const field of EDITABLE_FIELDS) {
      if (changes[field] !== undefined && changes[field] !== (contrato as any)[field]) {
        const valorAnterior = String((contrato as any)[field] ?? '');
        const valorNovo = String(changes[field] ?? '');

        validChanges[field] = changes[field];
        historyEntries.push({
          contrato_id: contractId,
          campo_alterado: field,
          valor_anterior: valorAnterior,
          valor_novo: valorNovo,
          alterado_por: role,
          usuario_id: userId,
        } as any);
      }
    }

    if (Object.keys(validChanges).length === 0) {
      throw new AppError('Nenhuma alteração válida fornecida', 400);
    }

    // Recalcular valor_sinal se cache_total ou percentual_sinal mudou
    const cacheTotal = (validChanges.cache_total as number) ?? Number(contrato.cache_total);
    const percentualSinal = (validChanges.percentual_sinal as number) ?? Number(contrato.percentual_sinal);
    validChanges.valor_sinal = Number(((cacheTotal * percentualSinal) / 100).toFixed(2));

    // Aplicar mudanças
    await contrato.update({
      ...validChanges,
      aceite_contratante: false,
      aceite_contratado: false,
      data_aceite_contratante: undefined,
      data_aceite_contratado: undefined,
      ultima_edicao_por: role,
      versao: contrato.versao + 1,
      status: ContractStatus.RASCUNHO,
    });

    // Registrar histórico
    await ContractHistoryModel.bulkCreate(historyEntries as any[]);

    return contrato.reload();
  }

  /**
   * Aceita o contrato pela parte indicada.
   * Quando ambas as partes aceitam, o status muda para 'aceito'.
   */
  async acceptContract(
    contractId: number,
    userId: number,
    role: 'contratante' | 'contratado',
  ): Promise<ContractModel> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    if (![ContractStatus.RASCUNHO, ContractStatus.AGUARDANDO_ACEITE].includes(contrato.status)) {
      throw new AppError('Contrato não pode ser aceito neste status', 400);
    }

    if (Number(contrato.cache_total) < 0) {
      throw new AppError('Valor do cache invalido', 400);
    }

    const updateData: Partial<ContractModel> = {} as any;

    if (role === 'contratante') {
      if (contrato.aceite_contratante) throw new AppError('Contratante já aceitou este contrato', 400);
      updateData.aceite_contratante = true;
      updateData.data_aceite_contratante = new Date() as any;
    } else {
      if (contrato.aceite_contratado) throw new AppError('Contratado já aceitou este contrato', 400);
      updateData.aceite_contratado = true;
      updateData.data_aceite_contratado = new Date() as any;
    }

    // Verificar se ambos aceitaram
    const outroAceite = role === 'contratante' ? contrato.aceite_contratado : contrato.aceite_contratante;
    if (outroAceite) {
      updateData.status = ContractStatus.ACEITO as any;
    } else {
      updateData.status = ContractStatus.AGUARDANDO_ACEITE as any;
    }

    await contrato.update(updateData as any);
    return contrato.reload();
  }

  /**
   * Cancela o contrato. Calcula penalidade baseada na antecedência.
   */
  async cancelContract(
    contractId: number,
    userId: number,
    role: 'contratante' | 'contratado',
    motivo: string,
  ): Promise<{ contrato: ContractModel; penalidade_percentual: number }> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    if ([ContractStatus.CANCELADO, ContractStatus.CONCLUIDO].includes(contrato.status)) {
      throw new AppError('Contrato já foi finalizado', 400);
    }

    // Calcular antecedência
    const agora = new Date();
    const dataEvento = new Date(contrato.data_evento);
    const horasAteEvento = (dataEvento.getTime() - agora.getTime()) / (1000 * 60 * 60);

    let penalidade_percentual = 0;
    if (role === 'contratante') {
      if (horasAteEvento > 72) {
        penalidade_percentual = Number(contrato.penalidade_cancelamento_72h);
      } else if (horasAteEvento > 24) {
        penalidade_percentual = Number(contrato.penalidade_cancelamento_24_72h);
      } else {
        penalidade_percentual = Number(contrato.penalidade_cancelamento_24h);
      }
    } else {
      // Contratado: multa de 20% se < 72h sem força maior
      penalidade_percentual = horasAteEvento < 72 ? 20 : 0;
    }

    await contrato.update({
      status: ContractStatus.CANCELADO,
      observacoes: `${contrato.observacoes || ''}\n[CANCELADO por ${role}]: ${motivo}`.trim(),
    });

    // Registrar no histórico
    await ContractHistoryModel.create({
      contrato_id: contractId,
      campo_alterado: 'status',
      valor_anterior: contrato.status,
      valor_novo: ContractStatus.CANCELADO,
      alterado_por: role,
      usuario_id: userId,
    });

    return { contrato: await contrato.reload(), penalidade_percentual };
  }

  async completeContract(contractId: number): Promise<ContractModel> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    if (contrato.status !== ContractStatus.ACEITO) {
      throw new AppError('Apenas contratos aceitos podem ser concluídos', 400);
    }

    await contrato.update({ status: ContractStatus.CONCLUIDO });

    // Increment shows_realizados for artist (or band members) and establishment
    if (contrato.artista_id) {
      await ArtistProfileModel.increment('shows_realizados', { by: 1, where: { id: contrato.artista_id } });
    } else if (contrato.banda_id) {
      const membros = await BandMemberModel.findAll({ where: { banda_id: contrato.banda_id } });
      const artistaIds = membros.map(m => m.perfil_artista_id).filter(Boolean);
      if (artistaIds.length) {
        await ArtistProfileModel.increment('shows_realizados', { by: 1, where: { id: artistaIds } });
      }
    }

    if (contrato.perfil_estabelecimento_id) {
      await EstablishmentProfileModel.increment('shows_realizados', { by: 1, where: { id: contrato.perfil_estabelecimento_id } });
    }

    return contrato.reload();
  }

  async getHistory(contractId: number): Promise<ContractHistoryModel[]> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    return ContractHistoryModel.findAll({
      where: { contrato_id: contractId },
      include: [{ association: 'User', attributes: ['id', 'nome_completo', 'email'] }],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Determina o papel do usuário em relação ao contrato.
   * Retorna 'contratante', 'contratado' ou null se não for parte.
   */
  async getUserRole(contractId: number, userId: number): Promise<'contratante' | 'contratado' | null> {
    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) return null;

    // Verificar se é dono do estabelecimento
    const estabelecimento = await EstablishmentProfileModel.findByPk(contrato.perfil_estabelecimento_id);
    if (estabelecimento && estabelecimento.usuario_id === userId) return 'contratante';

    // Verificar se é artista individual do contrato
    if (contrato.artista_id) {
      const artista = await ArtistProfileModel.findOne({
        where: { id: contrato.artista_id, usuario_id: userId },
      });
      if (artista) return 'contratado';
    }

    // Verificar se é líder da banda
    if (contrato.banda_id) {
      const lider = await BandMemberModel.findOne({
        where: { banda_id: contrato.banda_id, e_lider: true },
        include: [{
          association: 'ArtistProfile',
          where: { usuario_id: userId },
        }],
      });
      if (lider) return 'contratado';
    }

    return null;
  }
}

export const contractService = new ContractService();
