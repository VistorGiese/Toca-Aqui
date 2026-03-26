import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const bookingBaseSchema = z.object({
  titulo_evento: z.string().min(2, 'Título do evento deve ter ao menos 2 caracteres').trim(),
  descricao_evento: z.string().trim().optional(),
  data_show: z.string().date('data_show deve estar no formato YYYY-MM-DD'),
  perfil_estabelecimento_id: z.number().int().positive().optional(),
  horario_inicio: z.string().regex(timeRegex, 'horario_inicio deve estar no formato HH:MM'),
  horario_fim: z.string().regex(timeRegex, 'horario_fim deve estar no formato HH:MM'),
});

export const createBookingSchema = bookingBaseSchema.refine(
  (data) => data.horario_fim > data.horario_inicio,
  { message: 'horario_fim deve ser posterior ao horario_inicio', path: ['horario_fim'] }
);

export const updateBookingSchema = bookingBaseSchema.partial().superRefine((data, ctx) => {
  if (data.horario_inicio && data.horario_fim && data.horario_fim <= data.horario_inicio) {
    ctx.addIssue({ code: 'custom', message: 'horario_fim deve ser posterior ao horario_inicio', path: ['horario_fim'] });
  }
});

