import { z } from 'zod';

export const addFavoriteSchema = z.object({
  favoritavel_tipo: z.enum(['perfil_estabelecimento', 'perfil_artista', 'banda'], {
    message: 'Tipo de favorito inválido. Use: perfil_estabelecimento, perfil_artista ou banda',
  }),
  favoritavel_id: z.number({ message: 'favoritavel_id deve ser um número válido' }).int().positive(),
});
