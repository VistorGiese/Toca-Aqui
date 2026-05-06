import { z } from 'zod';

export const addFavoriteSchema = z.object({
  favoritavel_tipo: z.enum(['perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'], {
    message: 'Tipo de favorito inválido. Use: perfil_estabelecimento, perfil_artista, banda ou agendamento',
  }),
  favoritavel_id: z.number({ message: 'favoritavel_id deve ser um número válido' }).int().positive(),
});
