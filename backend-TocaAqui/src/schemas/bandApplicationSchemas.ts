import { z } from 'zod';

export const applyBandSchema = z.object({
  banda_id: z.number().int().positive().optional(),
  artista_id: z.number().int().positive().optional(),
  evento_id: z.number({ error: 'evento_id deve ser um número válido' }).int().positive(),
  mensagem: z.string().max(1000).optional(),
}).refine(data => data.banda_id || data.artista_id, {
  message: 'Informe banda_id ou artista_id',
});
