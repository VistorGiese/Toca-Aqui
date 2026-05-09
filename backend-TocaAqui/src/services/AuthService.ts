import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import EstablishmentMemberModel from '../models/EstablishmentMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { generateToken } from '../utils/jwt';
import { validateEmailFormat, validatePasswordFormat } from './userValidationServices';
import redisService from '../config/redis';
import { sendPasswordResetEmail, sendVerificationEmail } from './EmailService';
import { AppError } from '../errors/AppError';
import { geocodificarEndereco } from './GeocodingService';
import AddressModel from '../models/AddressModel';
import sequelize from '../config/database';

export interface RegisterParams {
  nome_completo: string;
  email: string;
  senha: string;
  tipo_usuario?: string;
}

export interface LoginResult {
  token: string;
  user: { id: number; nome_completo: string; email: string; role: string };
}

export class AuthService {
  async register(params: RegisterParams) {
    const { nome_completo, email, senha, tipo_usuario } = params;

    const emailError = validateEmailFormat(email);
    if (emailError) throw new AppError(emailError, 400);

    const passwordError = validatePasswordFormat(senha);
    if (passwordError) throw new AppError(passwordError, 400);

    const rolesValidas = ['establishment_owner', 'artist', 'common_user'];
    const role =
      tipo_usuario && rolesValidas.includes(tipo_usuario) ? tipo_usuario : 'common_user';

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) throw new AppError('Email já está em uso', 400);

    const hashedPassword = await bcrypt.hash(senha, 10);
    // DEV/TCC: verificação de email desativada — conta já criada como verificada
    const user = await UserModel.create({ nome_completo, email, senha: hashedPassword, role: role as any, email_verificado: true });

    return { id: user.id, nome_completo: user.nome_completo, email: user.email, role: user.role, email_verificado: true };
  }

  async login(email: string, senha: string): Promise<LoginResult> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) throw new AppError('Credenciais inválidas', 401);

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) throw new AppError('Credenciais inválidas', 401);

    // DEV/TCC: verificação de email desativada
    // if (!user.email_verificado) throw new AppError('Email não verificado. Verifique sua caixa de entrada.', 403);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id!, nome_completo: user.nome_completo, email: user.email, role: user.role } };
  }

  async logout(token: string, exp: number) {
    const ttlSeconds = exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds > 0) {
      await redisService.getClient().setex(`blacklist:${token}`, ttlSeconds, '1');
    }
  }

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      // Delay para evitar timing side-channel que permite enumeração de emails
      await new Promise(r => setTimeout(r, 200 + Math.random() * 100));
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await redisService.getClient().setex(`reset:${token}`, 60 * 60, String(user.id));
    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error('[AuthService] Falha ao enviar email de redefinição de senha:', err);
    }
  }

  async resetPassword(token: string, nova_senha: string) {
    const userId = await redisService.getClient().get(`reset:${token}`);
    if (!userId) throw new AppError('Token inválido ou expirado.', 400);

    const user = await UserModel.findByPk(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    const hashedPassword = await bcrypt.hash(nova_senha, 10);
    await user.update({ senha: hashedPassword });
    await redisService.getClient().del(`reset:${token}`);
  }

  async resendVerificationEmail(email: string) {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 100));
      return;
    }
    if (user.email_verificado) return;

    const token = crypto.randomBytes(32).toString('hex');
    await redisService.getClient().setex(`verify:${token}`, 60 * 60 * 24, String(user.id));
    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error('[AuthService] Falha ao reenviar email de verificação:', err);
    }
  }

  async verifyEmail(token: string) {
    const userId = await redisService.getClient().get(`verify:${token}`);
    if (!userId) throw new AppError('Token inválido ou expirado.', 400);

    const user = await UserModel.findByPk(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    if (user.email_verificado) return { alreadyVerified: true };

    await user.update({ email_verificado: true });
    await redisService.getClient().del(`verify:${token}`);
    return { alreadyVerified: false };
  }

  async getUserProfile(userId: number) {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfiles',
          include: [{ association: 'Address', attributes: ['rua', 'cidade', 'estado'] }],
        },
        { model: ArtistProfileModel, as: 'ArtistProfiles' },
        {
          model: EstablishmentMemberModel,
          as: 'EstablishmentMemberships',
          include: [
            {
              model: EstablishmentProfileModel,
              as: 'EstablishmentProfile',
              attributes: ['id', 'nome_estabelecimento', 'tipo_estabelecimento'],
            },
          ],
        },
      ],
    });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }

  async createEstablishmentProfile(userId: number, data: {
    nome_estabelecimento: string;
    tipo_estabelecimento?: string;
    descricao?: string;
    generos_musicais: string;
    horario_abertura: string;
    horario_fechamento: string;
    telefone_contato: string;
    endereco: {
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
  }) {
    const { endereco, ...rest } = data;

    const profile = await sequelize.transaction(async (t) => {
      const novoEndereco = await AddressModel.create(endereco, { transaction: t });

      const novoProfile = await EstablishmentProfileModel.create({
        usuario_id: userId,
        ...rest,
        tipo_estabelecimento: (data.tipo_estabelecimento as any) || 'bar',
        endereco_id: novoEndereco.id,
      }, { transaction: t });

      return novoProfile;
    });

    // Geocoding fora da transação — falha não reverte o cadastro
    const coords = await geocodificarEndereco(
      endereco.rua,
      endereco.numero,
      endereco.cidade,
      endereco.estado,
      endereco.cep
    );
    if (coords) {
      await profile.update({ latitude: coords.latitude, longitude: coords.longitude });
    }

    return profile;
  }

  async createArtistProfile(userId: number, data: {
    nome_artistico: string;
    biografia?: string;
    instrumentos?: any[];
    generos?: any[];
    anos_experiencia?: number;
    url_portfolio?: string;
    foto_perfil?: string;
    tipo_atuacao?: string;
    cache_minimo?: number;
    cache_maximo?: number;
    tem_estrutura_som?: boolean;
    estrutura_som?: string[];
    cidade?: string;
    estado?: string;
    links_sociais?: string[];
  }) {
    return ArtistProfileModel.create({
      usuario_id: userId,
      nome_artistico: data.nome_artistico,
      biografia: data.biografia,
      instrumentos: data.instrumentos || [],
      generos: data.generos || [],
      anos_experiencia: data.anos_experiencia || 0,
      url_portfolio: data.url_portfolio,
      foto_perfil: data.foto_perfil,
      tipo_atuacao: data.tipo_atuacao,
      cache_minimo: data.cache_minimo,
      cache_maximo: data.cache_maximo,
      tem_estrutura_som: data.tem_estrutura_som || false,
      estrutura_som: data.estrutura_som || [],
      cidade: data.cidade,
      estado: data.estado,
      links_sociais: data.links_sociais || [],
    });
  }
}

export const authService = new AuthService();

