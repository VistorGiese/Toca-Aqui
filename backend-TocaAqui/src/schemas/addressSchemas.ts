import { z } from 'zod';

export const createAddressSchema = z.object({
  rua: z.string().min(2, 'Rua deve ter ao menos 2 caracteres').trim(),
  numero: z.string().min(1, 'Número é obrigatório').trim(),
  bairro: z.string().min(2, 'Bairro deve ter ao menos 2 caracteres').trim(),
  cidade: z.string().min(2, 'Cidade deve ter ao menos 2 caracteres').trim(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)').toUpperCase(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 00000-000)'),
});

export const updateAddressSchema = createAddressSchema.partial();
