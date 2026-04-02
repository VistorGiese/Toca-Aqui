import { z } from 'zod';

export const applyBandSchema = z.object({
  banda_id: z.number().int().positive().optional(),
  artista_id: z.number().int().positive().optional(),
  evento_id: z.number({ error: 'evento_id deve ser um número válido' }).int().positive(),
  mensagem: z.string().max(1000).optional(),
  valor_proposto: z.number().positive('valor_proposto deve ser um numero positivo'),
});
