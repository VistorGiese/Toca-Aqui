import { z } from 'zod';

function normalizeCpf(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export const comprarIngressoSchema = z.object({
  agendamento_id: z.number().int().positive(),
  tipo: z.enum(['inteira', 'meia_entrada', 'vip']),
  nome_comprador: z.string().min(3).max(100),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .transform(normalizeCpf)
    .refine((val) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), 'CPF inválido'),
  telefone: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().min(10).max(15).optional(),
  ),
});
