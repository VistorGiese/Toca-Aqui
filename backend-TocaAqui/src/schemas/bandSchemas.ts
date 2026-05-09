import { z } from 'zod';

export const createBandSchema = z.object({
  // Obrigatórios
  nome_banda: z.string().min(2, 'Nome da banda deve ter ao menos 2 caracteres').trim(),
  perfil_artista_id: z.number({ error: 'perfil_artista_id deve ser um número válido' }).int().positive(),
  // Básicos
  descricao: z.string().trim().optional(),
  imagem: z.string().optional(),
  generos_musicais: z.array(z.string()).optional().default([]),
  // Localização
  cidade: z.string().trim().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').trim().toUpperCase().optional(),
  // Cachê
  cache_minimo: z.number().positive('cache_minimo deve ser positivo').optional(),
  cache_maximo: z.number().positive('cache_maximo deve ser positivo').optional(),
  // Contato
  telefone_contato: z.string().trim().optional(),
  // Links e material
  links_sociais: z.array(z.string()).optional().default([]),
  press_kit: z.array(z.string()).optional().default([]),
  // Estrutura de som
  tem_estrutura_som: z.boolean().optional().default(false),
  estrutura_som: z.array(z.string()).optional().default([]),
  // Disponibilidade
  esta_disponivel: z.boolean().optional().default(true),
  datas_indisponiveis: z.array(z.string()).optional().default([]),
  // Membros iniciais além do líder (convidados com status pending)
  membros: z.array(
    z.object({
      perfil_artista_id: z.number().int().positive(),
      funcao: z.string().trim().optional(),
    })
  ).optional().default([]),
});

export const inviteMemberSchema = z.object({
  banda_id: z.number({ error: 'banda_id deve ser um número válido' }).int().positive(),
  perfil_artista_id: z.number({ error: 'perfil_artista_id deve ser um número válido' }).int().positive(),
  funcao: z.string().trim().optional(),
});

export const respondInvitationSchema = z.object({
  invitation_id: z.number({ error: 'invitation_id deve ser um número válido' }).int().positive(),
  action: z.enum(['accept', 'reject'], { error: 'action deve ser "accept" ou "reject"' }),
});
