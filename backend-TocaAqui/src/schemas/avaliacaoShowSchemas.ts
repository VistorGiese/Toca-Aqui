import { z } from 'zod';

export const criarAvaliacaoSchema = z.object({
  agendamento_id: z.number().int().positive(),
  nota_artista: z.number().int().min(1).max(5),
  nota_local: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
  tags_artista: z.array(z.string()).optional(),
  tags_local: z.array(z.string()).optional(),
});
