import { z } from 'zod';
import { UserRole } from '../types/roles';

export const registroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').trim(),
  email: z.string().email('Formato de email inválido').toLowerCase().trim(),
  senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  tipo_usuario: z.enum([UserRole.ESTABLISHMENT_OWNER, UserRole.ARTIST, UserRole.COMMON_USER]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Formato de email inválido').toLowerCase().trim(),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const createEstablishmentProfileSchema = z.object({
  nome_estabelecimento: z.string().min(2, 'Nome do estabelecimento deve ter ao menos 2 caracteres').trim(),
  tipo_estabelecimento: z.enum(['bar', 'casa_show', 'restaurante', 'club', 'outro']).optional().default('bar'),
  descricao: z.string().trim().optional(),
  generos_musicais: z.string().min(1, 'Gêneros musicais são obrigatórios').trim(),
  horario_abertura: z.string().min(1, 'Horário de abertura é obrigatório'),
  horario_fechamento: z.string().min(1, 'Horário de fechamento é obrigatório'),
  endereco_id: z.number({ error: 'endereco_id deve ser um número válido' }).int().positive('endereco_id deve ser positivo'),
  telefone_contato: z.string().min(8, 'Telefone deve ter ao menos 8 caracteres').trim(),
});

export const createArtistProfileSchema = z.object({
  nome_artistico: z.string().min(2, 'Nome artístico deve ter ao menos 2 caracteres').trim(),
  biografia: z.string().trim().optional(),
  instrumentos: z.array(z.string()).optional().default([]),
  generos: z.array(z.string()).optional().default([]),
  anos_experiencia: z.number().int().min(0).optional().default(0),
  url_portfolio: z.string().url('URL do portfólio inválida').optional().or(z.literal('')),
  foto_perfil: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Formato de email inválido').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  nova_senha: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
});
