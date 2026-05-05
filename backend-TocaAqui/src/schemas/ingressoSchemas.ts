import { z } from 'zod';

export const comprarIngressoSchema = z.object({
  agendamento_id: z.number().int().positive(),
  tipo: z.enum(['inteira', 'meia_entrada', 'vip']),
  nome_comprador: z.string().min(3).max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  telefone: z.string().min(10).max(15),
});
