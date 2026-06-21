/**
 * Uso: npm run load:flow
 */

import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const pairs = new SharedArray('pairs', function () {
  return JSON.parse(open('./seed-data/throughput.json'));
});

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

function futureDateOnly(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export default function () {
  const pair = pairs[(__VU - 1) % pairs.length];
  const jsonHeaders = (token) => ({
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  // 1. Estabelecimento cria um evento — data única por VU/iteração evita
  // conflito de horário (BookingController valida sobreposição por
  // perfil_estabelecimento_id + data_show + janela de horário).
  const daysAhead = 100 + __VU * 1000 + __ITER;
  const bookingRes = http.post(
    `${BASE_URL}/agendamentos`,
    JSON.stringify({
      titulo_evento: `Show de Carga VU${__VU} Iter${__ITER}`,
      descricao_evento: 'Show gerado por teste de carga k6',
      data_show: futureDateOnly(daysAhead),
      perfil_estabelecimento_id: pair.perfilEstabelecimentoId,
      horario_inicio: '20:00',
      horario_fim: '23:00',
    }),
    jsonHeaders(pair.estabToken)
  );
  check(bookingRes, { 'evento criado (201)': (r) => r.status === 201 });

  const eventoId = bookingRes.json('id');

  // 2. Artista se candidata ao evento
  const aplicacaoRes = http.post(
    `${BASE_URL}/eventos`,
    JSON.stringify({
      evento_id: eventoId,
      artista_id: pair.artistaId,
      valor_proposto: 1500,
    }),
    jsonHeaders(pair.artistToken)
  );
  check(aplicacaoRes, { 'candidatura criada (201)': (r) => r.status === 201 });

  const aplicacaoId = aplicacaoRes.json('aplicacao.id');

  // 3. Estabelecimento aceita a candidatura (gera contrato, adquire o
  // lock distribuído em BandApplicationService.accept())
  const aceiteRes = http.put(
    `${BASE_URL}/eventos/${aplicacaoId}/aceitar`,
    JSON.stringify({}),
    jsonHeaders(pair.estabToken)
  );
  check(aceiteRes, { 'candidatura aceita (200)': (r) => r.status === 200 });
}
