import { z } from 'zod';

export const createBandSchema = z.object({
  nome_banda: z.string().min(2, 'Nome da banda deve ter ao menos 2 caracteres').trim(),
  descricao: z.string().trim().optional(),
  generos_musicais: z.array(z.string()).optional().default([]),
  perfil_artista_id: z.number({ error: 'perfil_artista_id deve ser um número válido' }).int().positive(),
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
