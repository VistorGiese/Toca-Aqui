import { z } from 'zod';

export const createAddressSchema = z.object({
  rua: z.string().min(2, 'Rua deve ter ao menos 2 caracteres').trim(),
  numero: z.string().optional().default(''),
  bairro: z.string().optional().default(''),
  cidade: z.string().min(2, 'Cidade deve ter ao menos 2 caracteres').trim(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)').toUpperCase(),
  cep: z.string().optional().default(''),
});

export const updateAddressSchema = createAddressSchema.partial();
