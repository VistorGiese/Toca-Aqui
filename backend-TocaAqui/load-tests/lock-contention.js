/**
 * Teste de carga (k6) — contenção do lock distribuído
 * (`LockService` / `BandApplicationService.accept()`, ver `docs/CONCURRENCY.md`)
 * contra a stack `docker-compose` (app:3000).
 *
 * Requer `npm run load:seed` previamente (gera `seed-data/lock-contention.json`
 * com 1 evento + M candidaturas pendentes do mesmo estabelecimento).
 *
 * Todas as M VUs disparam `PUT /eventos/:id/aceitar` ~simultaneamente, uma
 * para cada candidatura pendente. Apenas uma deve obter o lock (200 +
 * contrato); as demais devem receber 409 ("Outra candidatura está sendo
 * processada"), evidenciando a contenção sob carga real.
 *
 * Uso: npm run load:lock
 */

import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const data = JSON.parse(open('./seed-data/lock-contention.json'));

export const lockAccepted = new Counter('lock_accepted');
export const lockBusy = new Counter('lock_busy');

export const options = {
  scenarios: {
    lockContention: {
      executor: 'shared-iterations',
      vus: data.aplicacaoIds.length,
      iterations: data.aplicacaoIds.length,
      maxDuration: '30s',
    },
  },
};

export default function () {
  const aplicacaoId = data.aplicacaoIds[(__VU - 1) % data.aplicacaoIds.length];

  const res = http.put(
    `${BASE_URL}/eventos/${aplicacaoId}/aceitar`,
    JSON.stringify({}),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.estabToken}` } }
  );

  if (res.status === 200) {
    lockAccepted.add(1);
  } else if (res.status === 409) {
    lockBusy.add(1);
  }

  check(res, {
    'resposta é 200 (aceito) ou 409 (lock ocupado)': (r) => r.status === 200 || r.status === 409,
  });
}
