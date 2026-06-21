
const BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

async function get(path: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function main() {
  console.log('=== Seed de métricas — Toca Aqui API ===\n');
  console.log(`API: ${BASE_URL}\n`);

  // Health check
  const health = await get('/health');
  if (health.status !== 200) {
    console.error('API não está rodando. Inicie com npm run dev ou docker-compose up.');
    process.exit(1);
  }
  console.log('API online.\n');

  // Simula 10 chamadas a /contratos/meus (sem token — gera 401s)
  console.log('Fazendo 10 chamadas a GET /contratos/meus (sem token)...');
  for (let i = 0; i < 10; i++) {
    await get('/contratos/meus');
  }

  // Simula 5 chamadas a /contratos/:id inválidos (gera 401s)
  console.log('Fazendo 5 chamadas a GET /contratos/99999 (sem token)...');
  for (let i = 0; i < 5; i++) {
    await get('/contratos/99999');
  }

  // Busca métricas
  console.log('\n=== Resultado GET /api/metrics ===');
  const metrics = await get('/api/metrics');
  console.log(JSON.stringify(metrics.body, null, 2));
}

main().catch(console.error);
