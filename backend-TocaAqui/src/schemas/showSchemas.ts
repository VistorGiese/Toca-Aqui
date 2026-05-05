import { z } from 'zod';

export const getShowsSchema = z.object({
  query: z.object({
    cidade: z.string().optional(),
    genero: z.string().optional(),
    esta_semana: z.string().optional(),
    fim_de_semana: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
