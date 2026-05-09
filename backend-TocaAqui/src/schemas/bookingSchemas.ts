import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const bookingBaseSchema = z.object({
  titulo_evento: z.string().min(2, 'Título do evento deve ter ao menos 2 caracteres').trim(),
  descricao_evento: z.string().trim().optional(),
  data_show: z.string().date('data_show deve estar no formato YYYY-MM-DD'),
  perfil_estabelecimento_id: z.number({ error: 'perfil_estabelecimento_id deve ser um número válido' }).int().positive(),
  horario_inicio: z.string().regex(timeRegex, 'horario_inicio deve estar no formato HH:MM'),
  horario_fim: z.string().regex(timeRegex, 'horario_fim deve estar no formato HH:MM'),
  generos_musicais: z.string().max(255).optional(),
  genero_musical: z.string().max(100).optional(),
  cache_minimo: z.number().nonnegative().optional(),
  cache_maximo: z.number().nonnegative().optional(),
  esta_publico: z.boolean().optional(),
  preco_ingresso_inteira: z.number().nonnegative().optional(),
  preco_ingresso_meia: z.number().nonnegative().optional(),
  capacidade_maxima: z.number().int().positive().optional(),
  classificacao_etaria: z.number().int().nonnegative().optional(),
});

// Converte "HH:MM" para minutos totais
const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const createBookingSchema = bookingBaseSchema.superRefine((data, ctx) => {
  const inicio = toMinutes(data.horario_inicio);
  const fim = toMinutes(data.horario_fim);
  // Permite shows que cruzam meia-noite: só rejeita se início === fim
  if (inicio === fim) {
    ctx.addIssue({ code: 'custom', message: 'horario_fim não pode ser igual ao horario_inicio', path: ['horario_fim'] });
  }
  if (data.cache_minimo !== undefined && data.cache_maximo !== undefined && data.cache_maximo < data.cache_minimo) {
    ctx.addIssue({ code: 'custom', message: 'cache_maximo deve ser maior ou igual ao cache_minimo', path: ['cache_maximo'] });
  }
});

export const updateBookingSchema = bookingBaseSchema.partial().superRefine((data, ctx) => {
  if (data.horario_inicio && data.horario_fim) {
    const inicio = toMinutes(data.horario_inicio);
    const fim = toMinutes(data.horario_fim);
    if (inicio === fim) {
      ctx.addIssue({ code: 'custom', message: 'horario_fim não pode ser igual ao horario_inicio', path: ['horario_fim'] });
    }
  }
  if (data.cache_minimo !== undefined && data.cache_maximo !== undefined && data.cache_maximo < data.cache_minimo) {
    ctx.addIssue({ code: 'custom', message: 'cache_maximo deve ser maior ou igual ao cache_minimo', path: ['cache_maximo'] });
  }
});

