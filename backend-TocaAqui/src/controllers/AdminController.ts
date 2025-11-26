import { Request, Response } from 'express';
import UserModel, { UserRole } from '../models/UserModel';
import BandModel from '../models/BandModel';
import BookingModel from '../models/BookingModel';
import BandApplicationModel from '../models/BandApplicationModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';


export const getAllUsers = async (req: Request, res: Response) => {
  try {
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
      return res.status(400).json({ 
        error: 'Role inválida',
        validRoles: Object.values(UserRole)
      });
    }

    // Validar search term (prevenir SQL injection)
    if (searchTerm && searchTerm.length > 100) {
      return res.status(400).json({ error: 'Termo de busca muito longo (máximo 100 caracteres)' });
    }

    // Construir where clause
    const whereClause: any = {};
    
    if (roleFilter) {
      whereClause.role = roleFilter;
    }

    if (searchTerm) {
      const { Op } = require('sequelize');
      const sanitizedSearch = searchTerm.trim();
      whereClause[Op.or] = [
        { nome: { [Op.like]: `%${sanitizedSearch}%` } },
        { email: { [Op.like]: `%${sanitizedSearch}%` } },
      ];
    }

    // Buscar com paginação
    const { count, rows: users } = await UserModel.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'nome', 'email', 'role', 'createdAt', 'updatedAt'],
      include: [
        {
          model: ArtistProfileModel,
          as: 'ArtistProfiles',
          required: false,
        },
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfiles',
          required: false,
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
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};


export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    // Contar total de usuários
    const total = await UserModel.count();
    
    // Contar por role
    const admins = await UserModel.count({ where: { role: UserRole.ADMIN } });
    const artists = await UserModel.count({ where: { role: UserRole.ARTIST } });
    const establishments = await UserModel.count({ where: { role: UserRole.ESTABLISHMENT_OWNER } });
    const commonUsers = await UserModel.count({ where: { role: UserRole.COMMON_USER } });

    // Contar usuários com perfis criados
    const artistsWithProfile = await ArtistProfileModel.count();
    const establishmentsWithProfile = await EstablishmentProfileModel.count();

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
  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};


export const getEventStatistics = async (req: Request, res: Response) => {
  try {
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
        [BookingModel.sequelize!.fn('COUNT', BookingModel.sequelize!.col('id')), 'total_eventos'],
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
  } catch (error) {
    console.error('Erro ao buscar estatísticas de eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de eventos' });
  }
};


export const getBandStatistics = async (req: Request, res: Response) => {
  try {
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
        [BandApplicationModel.sequelize!.fn('COUNT', BandApplicationModel.sequelize!.col('id')), 'total_aplicacoes'],
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
  } catch (error) {
    console.error('Erro ao buscar estatísticas de bandas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de bandas' });
  }
};


export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
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
        attributes: ['id', 'nome', 'email', 'role', 'createdAt'],
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
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas do dashboard' });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID do usuário inválido' });
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
        },
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfiles',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
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
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};


export const getEventsByEstablishment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID do estabelecimento inválido' });
    }

    const establishmentId = Number(id);

    // Verificar se estabelecimento existe
    const establishment = await EstablishmentProfileModel.findByPk(establishmentId);
    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const events = await BookingModel.findAll({
      where: { perfil_estabelecimento_id: establishmentId },
      include: [
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfile',
          attributes: ['nome_estabelecimento', 'tipo_estabelecimento'],
        },
        {
          model: BandApplicationModel,
          as: 'BandApplications',
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
  } catch (error) {
    console.error('Erro ao buscar eventos do estabelecimento:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
};
