/**
 * Cache TTL constants (seconds)
 * Centraliza todos os TTLs do cache Redis para facilitar ajustes globais.
 */
export const CACHE_TTL = {
  /** Resources that change rarely (band/establishment profiles) */
  LONG: 3000,
  /** Resources that change moderately (bookings, listings) */
  MEDIUM: 600,
  /** Short-lived resources (notifications, application status) */
  SHORT: 60,
} as const;

/**
 * Cache key prefix patterns – keep consistent across controllers.
 *
 * List keys   → "<resource>:list:<sorted-params>"
 * Detail keys → "<resource>:<id>"
 */
export const CACHE_KEYS = {
  banda: (id: string | number) => `banda:${id}`,
  bandas: (params = 'all') => `bandas:list:${params}`,
  estabelecimento: (id: string | number) => `estabelecimento:${id}`,
  estabelecimentos: (params = 'all') => `estabelecimentos:list:${params}`,
  agendamento: (id: string | number) => `agendamento:${id}`,
  agendamentos: (params = 'all') => `agendamentos:list:${params}`,
  contrato: (id: string | number) => `contrato:${id}`,
  contratos: (params = 'all') => `contratos:list:${params}`,
  pagamento: (id: string | number) => `pagamento:${id}`,
  pagamentos: (params = 'all') => `pagamentos:list:${params}`,
} as const;
