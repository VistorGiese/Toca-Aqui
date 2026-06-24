import { z } from 'zod';
import { PDF_TEXT_FIELD_MAX } from '../constants/contractPdfConstants';

/** Campos TEXT/MEDIUMTEXT do contrato — usados também para armazenar PDF em base64 no fluxo offline. */
const contractTextField = z.string().max(PDF_TEXT_FIELD_MAX).optional();

export const editContractSchema = z.object({
  cache_total: z.number().positive('Cachê deve ser positivo').optional(),
  percentual_sinal: z.number().min(0).max(100).optional(),
  metodo_pagamento: z.enum(['pix', 'transferencia', 'cartao', 'dinheiro', 'stripe']).optional(),
  data_pagamento_sinal: z.string().date('Data inválida').optional(),
  data_pagamento_restante: z.string().date('Data inválida').optional(),
  obrigacoes_contratante: contractTextField,
  obrigacoes_contratado: contractTextField,
  penalidade_cancelamento_72h: z.number().min(0).max(100).optional(),
  penalidade_cancelamento_24_72h: z.number().min(0).max(100).optional(),
  penalidade_cancelamento_24h: z.number().min(0).max(100).optional(),
  direitos_imagem: z.boolean().optional(),
  infraestrutura_som: contractTextField,
  infraestrutura_backline: contractTextField,
  intervalos: contractTextField,
  observacoes: contractTextField,
  genero_musical: contractTextField,
});

export const cancelContractSchema = z.object({
  motivo: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres').max(1000),
});
