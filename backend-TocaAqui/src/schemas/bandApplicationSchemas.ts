import { z } from 'zod';

export const applyBandSchema = z.object({
  banda_id: z.number({ error: 'banda_id deve ser um número válido' }).int().positive(),
  evento_id: z.number({ error: 'evento_id deve ser um número válido' }).int().positive(),
});
