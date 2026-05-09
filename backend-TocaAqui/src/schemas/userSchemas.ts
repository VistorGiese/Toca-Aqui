import { z } from 'zod';
import { UserRole } from '../types/roles';

export const registroSchema = z.object({
  nome_completo: z.string().min(2, 'Nome completo deve ter ao menos 2 caracteres').trim(),
  email: z.string().email('Formato de email inválido').toLowerCase().trim(),
  senha: z.string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
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
  telefone_contato: z.string().min(8, 'Telefone deve ter ao menos 8 caracteres').trim(),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória').trim(),
    numero: z.string().min(1, 'Número é obrigatório').trim(),
    bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
    cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres').trim().toUpperCase(),
    cep: z.string().min(8, 'CEP inválido').trim(),
  }),
});

export const createArtistProfileSchema = z.object({
  nome_artistico: z.string().min(2, 'Nome artístico deve ter ao menos 2 caracteres').trim(),
  biografia: z.string().trim().optional(),
  instrumentos: z.array(z.string()).optional().default([]),
  generos: z.array(z.string()).optional().default([]),
  anos_experiencia: z.number().int().min(0).optional().default(0),
  url_portfolio: z.string().url('URL do portfólio inválida')
    .refine(url => url.startsWith('https://'), { message: 'URL do portfólio deve usar HTTPS' })
    .optional().or(z.literal('')),
  foto_perfil: z.string().optional(),
  tipo_atuacao: z.string().optional(),
  cache_minimo: z.number().min(0).optional(),
  cache_maximo: z.number().min(0).optional(),
  tem_estrutura_som: z.boolean().optional().default(false),
  estrutura_som: z.array(z.string()).optional().default([]),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  links_sociais: z.array(z.string()).optional().default([]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Formato de email inválido').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  nova_senha: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
});
