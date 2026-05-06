import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Database
  DB_HOST: z.string().min(1, 'DB_HOST é obrigatório').default('localhost'),
  DB_PORT: z.coerce.number().int().default(3306),
  DB_NAME: z.string().min(1, 'DB_NAME é obrigatório'),
  DB_USER: z.string().min(1, 'DB_USER é obrigatório'),
  DB_PASSWORD: z.string().default(''),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Email / SMTP
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@tocaaqui.com'),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL deve ser uma URL válida').default('http://localhost:5173'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('\n[FATAL] Variáveis de ambiente inválidas:');
  result.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  });
  console.error('\nVerifique o arquivo .env e corrija as variáveis acima.\n');
  process.exit(1);
}

export const env = result.data;

// Validação extra em produção
if (env.NODE_ENV === 'production') {
  const missing: string[] = [];
  if (!env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
  if (!env.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!env.SMTP_USER) missing.push('SMTP_USER');
  if (!env.SMTP_PASS) missing.push('SMTP_PASS');
  if (missing.length > 0) {
    console.error(`\n[FATAL] Variáveis obrigatórias em produção não configuradas: ${missing.join(', ')}\n`);
    process.exit(1);
  }
}
