import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createBookingSchema = z.object({
  titulo_evento: z.string().min(2, 'Título do evento deve ter ao menos 2 caracteres').trim(),
  descricao_evento: z.string().trim().optional(),
  data_show: z.string().date('data_show deve estar no formato YYYY-MM-DD'),
  perfil_estabelecimento_id: z.number({ error: 'perfil_estabelecimento_id deve ser um número válido' }).int().positive(),
  horario_inicio: z.string().regex(timeRegex, 'horario_inicio deve estar no formato HH:MM'),
  horario_fim: z.string().regex(timeRegex, 'horario_fim deve estar no formato HH:MM'),
}).refine((data) => data.horario_fim > data.horario_inicio, {
  message: 'horario_fim deve ser posterior ao horario_inicio',
  path: ['horario_fim'],
});

export const updateBookingSchema = createBookingSchema.partial();
