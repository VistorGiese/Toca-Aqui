import { Op } from 'sequelize';
import BookingModel from '../models/BookingModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import ContractModel from '../models/ContractModel';
import BandModel from '../models/BandModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import UserModel from '../models/UserModel';
import { notFound } from '../errors/AppError';

class ShowService {
  async getPublicShows(params: {
    cidade?: string;
    genero?: string;
    data_inicio?: string;
    data_fim?: string;
    esta_semana?: boolean;
    fim_de_semana?: boolean;
    esta_hoje?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ shows: any[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const whereClause: any = {
      esta_publico: true,
      data_show: { [Op.gte]: hoje },
    };

    if (params.genero) {
      whereClause.genero_musical = { [Op.like]: `%${params.genero}%` };
    }

    if (params.data_inicio && params.data_fim) {
      whereClause.data_show = {
        [Op.between]: [new Date(params.data_inicio), new Date(params.data_fim)],
      };
    } else if (params.esta_semana) {
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() + 7);
      whereClause.data_show = { [Op.between]: [hoje, fimSemana] };
    } else if (params.fim_de_semana) {
      const diaSemana = hoje.getDay();
      const diasAteSabado = 6 - diaSemana;
      const sabado = new Date(hoje);
      sabado.setDate(hoje.getDate() + diasAteSabado);
      const domingo = new Date(sabado);
      domingo.setDate(sabado.getDate() + 1);
      domingo.setHours(23, 59, 59, 999);
      whereClause.data_show = { [Op.between]: [sabado, domingo] };
    } else if (params.esta_hoje) {
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23, 59, 59, 999);
      whereClause.data_show = { [Op.between]: [hoje, fimHoje] };
    } else {
      whereClause.data_show = { [Op.gte]: hoje };
    }

    const includeEstabelecimento: any = {
      model: EstablishmentProfileModel,
      as: 'EstablishmentProfile',
      include: [{ model: AddressModel, as: 'Address' }],
    };

    if (params.cidade) {
      includeEstabelecimento.include[0].where = {
        cidade: { [Op.like]: `%${params.cidade}%` },
      };
      includeEstabelecimento.required = true;
    }

    const { count, rows } = await BookingModel.findAndCountAll({
      where: whereClause,
      include: [
        includeEstabelecimento,
        {
          model: ContractModel,
          as: 'Contract',
          required: false,
          where: { status: 'aceito' },
          include: [{ model: BandModel, as: 'Band' }],
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

  async getShowById(id: number, usuario_id?: number): Promise<any> {
    const show = await BookingModel.findOne({
      where: { id, esta_publico: true },
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
          include: [{ model: BandModel, as: 'Band' }],
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
      ...show.toJSON(),
      ingressos_disponiveis: ingressosDisponiveis,
      esgotado: show.capacidade_maxima
        ? show.ingressos_vendidos >= show.capacidade_maxima
        : false,
    };
  }

  async getShowsDestaque(limit = 10): Promise<any[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const shows = await BookingModel.findAll({
      where: {
        esta_publico: true,
        data_show: { [Op.gte]: hoje },
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
          include: [{ model: BandModel, as: 'Band' }],
        },
      ],
      order: [['data_show', 'ASC']],
      limit,
    });

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
          include: [{ model: BandModel, as: 'Band' }],
        },
      ],
      order: [['data_show', 'ASC']],
      limit: 20,
    });

    return { tipo: 'shows', resultados: shows };
  }
}

export const showService = new ShowService();
