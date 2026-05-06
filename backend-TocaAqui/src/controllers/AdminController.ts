import { Request, Response } from 'express';
import { Op } from 'sequelize';
import UserModel, { UserRole } from '../models/UserModel';
import BandModel from '../models/BandModel';
import BookingModel from '../models/BookingModel';
import BandApplicationModel from '../models/BandApplicationModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';


export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  // Paginação com limites
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const requestedLimit = parseInt(req.query.limit as string) || 50;
  const limit = Math.min(Math.max(1, requestedLimit), 100); // Max 100 por página
  const offset = (page - 1) * limit;

  // Filtros
  const roleFilter = req.query.role as string;
  const searchTerm = req.query.search as string;

  // Validar filtro de role
  if (roleFilter && !Object.values(UserRole).includes(roleFilter as UserRole)) {
    throw new AppError('Role inválida', 400);
  }

  // Validar search term (prevenir SQL injection)
  if (searchTerm && searchTerm.length > 100) {
    throw new AppError('Termo de busca muito longo (máximo 100 caracteres)', 400);
  }

  // Construir where clause
  const whereClause: any = {};

  if (roleFilter) {
    whereClause.role = roleFilter;
  }

  if (searchTerm) {
    const sanitizedSearch = searchTerm.trim();
    whereClause[Op.or] = [
      { nome: { [Op.like]: `%${sanitizedSearch}%` } },
      { email: { [Op.like]: `%${sanitizedSearch}%` } },
    ];
  }

  // Buscar com paginação
  const { count, rows: users } = await UserModel.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'nome_completo', 'email', 'role', 'createdAt', 'updatedAt'],
    include: [
      {
        model: ArtistProfileModel,
        as: 'ArtistProfiles',
        required: false,
        attributes: ['id', 'nome_artistico', 'foto_perfil'],
      },
      {
        model: EstablishmentProfileModel,
        as: 'EstablishmentProfiles',
        required: false,
        attributes: ['id', 'nome_estabelecimento', 'tipo_estabelecimento'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
    filters: {
      role: roleFilter || 'all',
      search: searchTerm || '',
    },
    users,
  });
});


export const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
  const [total, admins, artists, establishments, commonUsers, artistsWithProfile, establishmentsWithProfile] = await Promise.all([
    UserModel.count(),
    UserModel.count({ where: { role: UserRole.ADMIN } }),
    UserModel.count({ where: { role: UserRole.ARTIST } }),
    UserModel.count({ where: { role: UserRole.ESTABLISHMENT_OWNER } }),
    UserModel.count({ where: { role: UserRole.COMMON_USER } }),
    ArtistProfileModel.count(),
    EstablishmentProfileModel.count(),
  ]);

  res.json({
    usuarios: {
      total,
      porTipo: {
        admins,
        artistas: artists,
        estabelecimentos: establishments,
        usuarios_comuns: commonUsers,
      },
      comPerfil: {
        artistas: artistsWithProfile,
        estabelecimentos: establishmentsWithProfile,
      },
    },
  });
});


export const getEventStatistics = asyncHandler(async (req: Request, res: Response) => {
  // Total de eventos
  const totalEvents = await BookingModel.count();

  // Eventos por status
  const pendingEvents = await BookingModel.count({ where: { status: 'pendente' } });
  const acceptedEvents = await BookingModel.count({ where: { status: 'aceito' } });
  const canceledEvents = await BookingModel.count({ where: { status: 'cancelado' } });

  // Top 10 estabelecimentos com mais eventos criados
  const eventsByEstablishment = await BookingModel.findAll({
    attributes: [
      'perfil_estabelecimento_id',
      [BookingModel.sequelize!.fn('COUNT', BookingModel.sequelize!.literal('`Booking`.`id`')), 'total_eventos'],
    ],
    include: [
      {
        model: EstablishmentProfileModel,
        as: 'EstablishmentProfile',
        attributes: ['nome_estabelecimento', 'tipo_estabelecimento'],
      },
    ],
    group: ['perfil_estabelecimento_id', 'EstablishmentProfile.id'],
    order: [[BookingModel.sequelize!.literal('total_eventos'), 'DESC']],
    limit: 10,
    raw: false,
  });

  res.json({
    eventos: {
      total: totalEvents,
      porStatus: {
        pendentes: pendingEvents,
        aceitos: acceptedEvents,
        cancelados: canceledEvents,
      },
      top10Estabelecimentos: eventsByEstablishment,
    },
  });
});


export const getBandStatistics = asyncHandler(async (req: Request, res: Response) => {
  // Total de bandas
  const totalBands = await BandModel.count();

  // Total de aplicações
  const totalApplications = await BandApplicationModel.count();
  const pendingApplications = await BandApplicationModel.count({
    where: { status: 'pendente' }
  });
  const acceptedApplications = await BandApplicationModel.count({
    where: { status: 'aceito' }
  });
  const rejectedApplications = await BandApplicationModel.count({
    where: { status: 'rejeitado' }
  });

  const topBands = await BandApplicationModel.findAll({
    attributes: [
      'banda_id',
      [BandApplicationModel.sequelize!.fn('COUNT', BandApplicationModel.sequelize!.literal('`BandApplication`.`id`')), 'total_aplicacoes'],
    ],
    include: [
      {
        model: BandModel,
        as: 'Band',
        attributes: ['nome_banda', 'descricao'],
      },
    ],
    group: ['banda_id', 'Band.id'],
    order: [[BandApplicationModel.sequelize!.literal('total_aplicacoes'), 'DESC']],
    limit: 10,
    raw: false,
  });

  res.json({
    bandas: {
      total: totalBands,
    },
    aplicacoes: {
      total: totalApplications,
      porStatus: {
        pendentes: pendingApplications,
        aceitas: acceptedApplications,
        rejeitadas: rejectedApplications,
      },
      top10BandasMaisAplicadas: topBands,
    },
  });
});


export const getDashboardMetrics = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalBands,
    totalEvents,
    totalApplications,
    pendingApplications,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    UserModel.count(),
    BandModel.count(),
    BookingModel.count(),
    BandApplicationModel.count(),
    BandApplicationModel.count({ where: { status: 'pendente' } }),
    // 5 usuários mais recentes
    UserModel.findAll({
      attributes: ['id', 'nome_completo', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
    // 5 eventos mais recentes
    BookingModel.findAll({
      attributes: ['id', 'titulo_evento', 'data_show', 'status', 'createdAt'],
      include: [
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfile',
          attributes: ['nome_estabelecimento'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
  ]);

  res.json({
    resumo: {
      totalUsuarios: totalUsers,
      totalBandas: totalBands,
      totalEventos: totalEvents,
      totalAplicacoes: totalApplications,
      aplicacoesPendentes: pendingApplications,
    },
    recentes: {
      usuarios: recentUsers,
      eventos: recentEvents,
    },
    timestamp: new Date().toISOString(),
  });
});


export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new AppError('ID do usuário inválido', 400);
  }

  const userId = Number(id);

  // Buscar usuário com todos os detalhes
  const user = await UserModel.findByPk(userId, {
    attributes: { exclude: ['senha'] },
    include: [
      {
        model: ArtistProfileModel,
        as: 'ArtistProfiles',
        required: false,
        attributes: { exclude: ['created_at', 'updated_at'] },
      },
      {
        model: EstablishmentProfileModel,
        as: 'EstablishmentProfiles',
        required: false,
        attributes: { exclude: ['created_at', 'updated_at'] },
      },
    ],
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const [totalBandasMembro, totalEventos] = await Promise.all([
    BandMemberModel.count({ where: { perfil_artista_id: user.id } }),
    BookingModel.count({
      include: [{
        model: EstablishmentProfileModel,
        as: 'EstablishmentProfile',
        where: { usuario_id: user.id },
        required: true,
      }],
    }),
  ]);

  res.json({
    user,
    statistics: {
      bandas_que_participa: totalBandasMembro,
      eventos_criados: totalEventos,
    },
  });
});


export const getEventsByEstablishment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(Number(id))) {
    throw new AppError('ID do estabelecimento inválido', 400);
  }

  const establishmentId = Number(id);

  // Verificar se estabelecimento existe
  const establishment = await EstablishmentProfileModel.findByPk(establishmentId);
  if (!establishment) {
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  const events = await BookingModel.findAll({
    where: { perfil_estabelecimento_id: establishmentId },
    attributes: { exclude: ['created_at', 'updated_at'] },
    include: [
      {
        model: EstablishmentProfileModel,
        as: 'EstablishmentProfile',
        attributes: ['nome_estabelecimento', 'tipo_estabelecimento'],
      },
      {
        model: BandApplicationModel,
        as: 'Applications',
        attributes: ['id', 'status', 'banda_id'],
        include: [
          {
            model: BandModel,
            as: 'Band',
            attributes: ['nome_banda', 'descricao'],
          },
        ],
      },
    ],
    order: [['data_show', 'DESC']],
  });

  res.json({
    estabelecimento_id: establishmentId,
    nome_estabelecimento: establishment.nome_estabelecimento,
    total_eventos: events.length,
    eventos: events,
  });
});
