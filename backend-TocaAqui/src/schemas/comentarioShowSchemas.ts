import { z } from 'zod';

export const criarComentarioSchema = z.object({
  agendamento_id: z.number().int().positive(),
  texto: z.string().min(1).max(280),
  parent_id: z.number().int().positive().optional(),
});
