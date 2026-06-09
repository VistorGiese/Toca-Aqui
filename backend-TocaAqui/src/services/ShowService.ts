import { Op } from 'sequelize';
import BookingModel, { BookingStatus } from '../models/BookingModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import ContractModel from '../models/ContractModel';
import BandModel from '../models/BandModel';
import BandApplicationModel from '../models/BandApplicationModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import UserModel from '../models/UserModel';
import { notFound } from '../errors/AppError';

type ShowListParams = {
  cidade?: string;
  genero?: string;
  data_inicio?: string;
  data_fim?: string;
  esta_semana?: boolean;
  fim_de_semana?: boolean;
  esta_hoje?: boolean;
  page?: number;
  limit?: number;
};

class ShowService {
  private startOfToday(): Date {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  }

  private buildDateShowFilter(
    params: Pick<ShowListParams, 'data_inicio' | 'data_fim' | 'esta_semana' | 'fim_de_semana' | 'esta_hoje'>,
    hoje: Date,
  ): Record<string | symbol, unknown> {
    if (params.data_inicio && params.data_fim) {
      return { [Op.between]: [new Date(params.data_inicio), new Date(params.data_fim)] };
    }
    if (params.esta_semana) {
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() + 7);
      return { [Op.between]: [hoje, fimSemana] };
    }
    if (params.fim_de_semana) {
      const diaSemana = hoje.getDay();
      const diasAteSabado = 6 - diaSemana;
      const sabado = new Date(hoje);
      sabado.setDate(hoje.getDate() + diasAteSabado);
      const domingo = new Date(sabado);
      domingo.setDate(sabado.getDate() + 1);
      domingo.setHours(23, 59, 59, 999);
      return { [Op.between]: [sabado, domingo] };
    }
    if (params.esta_hoje) {
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23, 59, 59, 999);
      return { [Op.between]: [hoje, fimHoje] };
    }
    return { [Op.gte]: hoje };
  }

  private bandInclude() {
    return {
      model: BandModel,
      as: 'Band',
      attributes: ['id', 'nome_banda', 'imagem', 'generos_musicais'],
    };
  }

  private buildEstablishmentInclude(cidade?: string) {
    const includeEstabelecimento: any = {
      model: EstablishmentProfileModel,
      as: 'EstablishmentProfile',
      include: [{ model: AddressModel, as: 'Address' }],
    };

    if (cidade) {
      includeEstabelecimento.include[0].where = {
        cidade: { [Op.like]: `%${cidade}%` },
      };
      includeEstabelecimento.required = true;
    }

    return includeEstabelecimento;
  }

  private buildConfirmedIncludes(cidade?: string) {
    return [
      this.buildEstablishmentInclude(cidade),
      {
        model: BandApplicationModel,
        as: 'Applications',
        where: { status: 'aceito' },
        required: false,
        include: [
          this.bandInclude(),
          {
            model: ArtistProfileModel,
            as: 'ArtistProfile',
            attributes: ['id', 'nome_artistico', 'foto_perfil'],
          },
        ],
      },
      {
        model: ContractModel,
        as: 'Contract',
        required: false,
        include: [this.bandInclude()],
      },
    ];
  }

  private enrichShowWithArtist(show: BookingModel): Record<string, unknown> {
    const json = show.toJSON() as Record<string, unknown>;
    const apps = (json.Applications as Array<Record<string, unknown>> | undefined) ?? [];
    const accepted = apps.find((a) => a.status === 'aceito') ?? apps[0];
    const artistProfile = accepted?.ArtistProfile as Record<string, unknown> | undefined;
    const band = (accepted?.Band ?? (json.Contract as any)?.Band) as Record<string, unknown> | undefined;

    const nome_artista =
      artistProfile?.nome_artistico ??
      band?.nome_banda ??
      null;
    const foto_artista =
      artistProfile?.foto_perfil ??
      band?.imagem ??
      null;

    return { ...json, nome_artista, foto_artista };
  }

  async getPublicShows(params: ShowListParams): Promise<{ shows: any[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const hoje = this.startOfToday();

    const whereClause: any = {
      esta_publico: true,
      data_show: this.buildDateShowFilter(params, hoje),
    };

    if (params.genero) {
      whereClause.genero_musical = { [Op.like]: `%${params.genero}%` };
    }

    const { count, rows } = await BookingModel.findAndCountAll({
      where: whereClause,
      include: [
        this.buildEstablishmentInclude(params.cidade),
        {
          model: ContractModel,
          as: 'Contract',
          required: false,
          where: { status: 'aceito' },
          include: [this.bandInclude()],
        },
      ],
      order: [['data_show', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      shows: rows,
      total: count,
      page,
      totalPages,
    };
  }

  /**
   * Shows futuros com artista confirmado (status aceito) de todos os estabelecimentos.
   * Apenas eventos públicos — mesmo critério da aba Encerradas do estabelecimento.
   */
  async getConfirmedShows(params: ShowListParams): Promise<{ shows: any[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    const hoje = this.startOfToday();

    const whereClause: any = {
      esta_publico: true,
      status: BookingStatus.ACEITO,
      data_show: this.buildDateShowFilter(params, hoje),
    };

    if (params.genero) {
      whereClause.genero_musical = { [Op.like]: `%${params.genero}%` };
    }

    const { count, rows } = await BookingModel.findAndCountAll({
      where: whereClause,
      include: this.buildConfirmedIncludes(params.cidade),
      order: [['data_show', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      shows: rows.map((row) => this.enrichShowWithArtist(row)),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getShowById(id: number, usuario_id?: number): Promise<any> {
    const show = await BookingModel.findOne({
      where: { id, esta_publico: true },
      include: [
        this.buildEstablishmentInclude(),
        {
          model: BandApplicationModel,
          as: 'Applications',
          where: { status: 'aceito' },
          required: false,
          include: [
            this.bandInclude(),
            {
              model: ArtistProfileModel,
              as: 'ArtistProfile',
              attributes: ['id', 'nome_artistico', 'foto_perfil'],
            },
          ],
        },
        {
          model: ContractModel,
          as: 'Contract',
          required: false,
          where: { status: 'aceito' },
          include: [this.bandInclude()],
        },
      ],
    });

    if (!show) {
      throw notFound('Show não encontrado');
    }

    const ingressosDisponiveis = show.capacidade_maxima
      ? Math.max(0, show.capacidade_maxima - show.ingressos_vendidos)
      : null;

    return {
      ...this.enrichShowWithArtist(show),
      ingressos_disponiveis: ingressosDisponiveis,
      esgotado: show.capacidade_maxima
        ? show.ingressos_vendidos >= show.capacidade_maxima
        : false,
    };
  }

  async getShowsDestaque(limit = 10): Promise<any[]> {
    const { shows } = await this.getConfirmedShows({ limit });
    return shows;
  }

  async searchShows(query: string, tipo?: 'shows' | 'artistas' | 'locais'): Promise<any> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (tipo === 'artistas') {
      const artistas = await ArtistProfileModel.findAll({
        where: {
          [Op.or]: [
            { nome_artistico: { [Op.like]: `%${query}%` } },
            { biografia: { [Op.like]: `%${query}%` } },
          ],
        },
        include: [{ model: UserModel, as: 'User', attributes: ['id', 'nome_completo'] }],
        limit: 20,
      });
      return { tipo: 'artistas', resultados: artistas };
    }

    if (tipo === 'locais') {
      const locais = await EstablishmentProfileModel.findAll({
        where: {
          nome_estabelecimento: { [Op.like]: `%${query}%` },
        },
        include: [{ model: AddressModel, as: 'Address' }],
        limit: 20,
      });
      return { tipo: 'locais', resultados: locais };
    }

    const shows = await BookingModel.findAll({
      where: {
        esta_publico: true,
        data_show: { [Op.gte]: hoje },
        [Op.or]: [
          { titulo_evento: { [Op.like]: `%${query}%` } },
          { descricao_evento: { [Op.like]: `%${query}%` } },
          { genero_musical: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfile',
          include: [{ model: AddressModel, as: 'Address' }],
        },
        {
          model: ContractModel,
          as: 'Contract',
          required: false,
          where: { status: 'aceito' },
          include: [this.bandInclude()],
        },
      ],
      order: [['data_show', 'ASC']],
      limit: 20,
    });

    return { tipo: 'shows', resultados: shows };
  }
}

export const showService = new ShowService();
