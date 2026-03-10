import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { generateToken } from '../utils/jwt';
import { validateEmailFormat, validatePasswordFormat } from './userValidationServices';
import redisService from '../config/redis';
import { sendPasswordResetEmail, sendVerificationEmail } from './EmailService';

export interface RegisterParams {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario?: string;
}

export interface LoginResult {
  token: string;
  user: { id: number; nome: string; email: string; role: string };
}

export class AuthService {
  async register(params: RegisterParams) {
    const { nome, email, senha, tipo_usuario } = params;

    const emailError = validateEmailFormat(email);
    if (emailError) throw { statusCode: 400, message: emailError };

    const passwordError = validatePasswordFormat(senha);
    if (passwordError) throw { statusCode: 400, message: passwordError };

    const rolesValidas = ['admin', 'establishment_owner', 'artist', 'common_user'];
    const role =
      tipo_usuario && rolesValidas.includes(tipo_usuario) ? tipo_usuario : 'common_user';

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) throw { statusCode: 400, message: 'Email já está em uso' };

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await UserModel.create({ nome, email, senha: hashedPassword, role: role as any, email_verificado: false });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await redisService.getClient().setex(`verify:${verifyToken}`, 60 * 60 * 24, String(user.id));
    sendVerificationEmail(email, verifyToken).catch((err) =>
      console.error('Falha ao enviar email de verificação:', err)
    );

    return { id: user.id, nome: user.nome, email: user.email, role: user.role, email_verificado: false };
  }

  async login(email: string, senha: string): Promise<LoginResult> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) throw { statusCode: 401, message: 'Credenciais inválidas' };

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) throw { statusCode: 401, message: 'Credenciais inválidas' };

    if (!user.email_verificado) {
      throw { statusCode: 403, message: 'Email não verificado. Verifique sua caixa de entrada.' };
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id!, nome: user.nome, email: user.email, role: user.role } };
  }

  async logout(token: string, exp: number) {
    const ttlSeconds = exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds > 0) {
      await redisService.getClient().setex(`blacklist:${token}`, ttlSeconds, '1');
    }
  }

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) return; // resposta genérica — não revelar se email existe

    const token = crypto.randomBytes(32).toString('hex');
    await redisService.getClient().setex(`reset:${token}`, 60 * 60, String(user.id));
    await sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, nova_senha: string) {
    const userId = await redisService.getClient().get(`reset:${token}`);
    if (!userId) throw { statusCode: 400, message: 'Token inválido ou expirado.' };

    const user = await UserModel.findByPk(userId);
    if (!user) throw { statusCode: 404, message: 'Usuário não encontrado.' };

    const hashedPassword = await bcrypt.hash(nova_senha, 10);
    await user.update({ senha: hashedPassword });
    await redisService.getClient().del(`reset:${token}`);
  }

  async verifyEmail(token: string) {
    const userId = await redisService.getClient().get(`verify:${token}`);
    if (!userId) throw { statusCode: 400, message: 'Token inválido ou expirado.' };

    const user = await UserModel.findByPk(userId);
    if (!user) throw { statusCode: 404, message: 'Usuário não encontrado.' };

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
      ],
    });
    if (!user) throw { statusCode: 404, message: 'Usuário não encontrado' };
    return user;
  }

  async createEstablishmentProfile(userId: number, data: {
    nome_estabelecimento: string;
    tipo_estabelecimento?: string;
    descricao?: string;
    generos_musicais: string;
    horario_abertura: string;
    horario_fechamento: string;
    endereco_id: number;
    telefone_contato: string;
  }) {
    const existing = await EstablishmentProfileModel.findOne({
      where: { endereco_id: data.endereco_id, esta_ativo: true },
    });
    if (existing) {
      throw {
        statusCode: 400,
        message: 'Este endereço já está sendo utilizado por outro estabelecimento ativo',
        extra: { id: existing.id, nome: existing.nome_estabelecimento },
      };
    }

    return EstablishmentProfileModel.create({
      usuario_id: userId,
      ...data,
      tipo_estabelecimento: (data.tipo_estabelecimento as any) || 'bar',
    });
  }

  async createArtistProfile(userId: number, data: {
    nome_artistico: string;
    biografia?: string;
    instrumentos?: any[];
    generos?: any[];
    anos_experiencia?: number;
    url_portfolio?: string;
    foto_perfil?: string;
  }) {
    return ArtistProfileModel.create({
      usuario_id: userId,
      nome_artistico: data.nome_artistico,
      biografia: data.biografia,
      instrumentos: JSON.stringify(data.instrumentos || []),
      generos: JSON.stringify(data.generos || []),
      anos_experiencia: data.anos_experiencia || 0,
      url_portfolio: data.url_portfolio,
      foto_perfil: data.foto_perfil,
    });
  }
}

export const authService = new AuthService();
