import { z } from 'zod';

export const editContractSchema = z.object({
  cache_total: z.number().positive('Cachê deve ser positivo').optional(),
  percentual_sinal: z.number().min(0).max(100).optional(),
  metodo_pagamento: z.enum(['pix', 'transferencia', 'cartao', 'dinheiro', 'stripe']).optional(),
  data_pagamento_sinal: z.string().date('Data inválida').optional(),
  data_pagamento_restante: z.string().date('Data inválida').optional(),
  obrigacoes_contratante: z.string().max(2000).optional(),
  obrigacoes_contratado: z.string().max(2000).optional(),
  penalidade_cancelamento_72h: z.number().min(0).max(100).optional(),
  penalidade_cancelamento_24_72h: z.number().min(0).max(100).optional(),
  penalidade_cancelamento_24h: z.number().min(0).max(100).optional(),
  direitos_imagem: z.boolean().optional(),
  infraestrutura_som: z.string().max(1000).optional(),
  infraestrutura_backline: z.string().max(1000).optional(),
  intervalos: z.string().max(500).optional(),
  observacoes: z.string().max(2000).optional(),
  genero_musical: z.string().max(255).optional(),
});

export const cancelContractSchema = z.object({
  motivo: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres').max(1000),
});
