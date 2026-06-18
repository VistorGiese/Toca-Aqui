/**
 * Teste E2E — Fluxo "criar evento → artista se candidata → estabelecimento aceita"
 *
 * Exercita a pilha completa via HTTP (supertest) → Controllers → Services →
 * Sequelize → SQLite in-memory, incluindo o lock distribuído do
 * `BandApplicationService.accept()` (ver `docs/CONCURRENCY.md`).
 *
 * Redis é substituído por um fake client em memória (`fakeRedis.ts`) que
 * implementa `getClient().set/eval` para que `LockService` funcione de
 * verdade (sem cair no fail-open). Email e notificações são mockados para
 * isolar efeitos colaterais.
 */

// ── Env vars — devem estar antes de qualquer import ────────────────────────
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

// ── Mocks hoistados pelo Jest ──────────────────────────────────────────────

// Substitui MySQL por SQLite in-memory
jest.mock('../../config/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Sequelize } = require('sequelize');
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
});

// Redis — fake client em memória com getClient(), para o LockService funcionar de verdade
jest.mock('../../config/redis', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mockRedisModule } = require('../helpers/fakeRedis');
  return mockRedisModule();
});

// Notificações — evita efeito colateral nos testes
jest.mock('../../services/NotificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

// Email — evita tentativas de conexão SMTP
jest.mock('../../services/EmailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
  })),
}));

// ── Imports após os mocks ──────────────────────────────────────────────────
import request from 'supertest';
import sequelize from '../../config/database';
import '../../models/associations';
import UserModel from '../../models/UserModel';
import EstablishmentProfileModel from '../../models/EstablishmentProfileModel';
import ArtistProfileModel from '../../models/ArtistProfileModel';
import { buildE2EApp } from '../helpers/testApp';
import { makeToken, authHeader, assertError } from '../helpers/apiHelpers';
import {
  makeUserData,
  makeEstablishmentData,
  makeArtistProfileData,
  makeBookingData,
} from '../helpers/factories';

const app = buildE2EApp();

// ── IDs/tokens de contexto (preenchidos em beforeAll) ──────────────────────
let estab1Token: string;
let estab2Token: string;
let artista1Token: string;
let artista2Token: string;
let perfilEstab1Id: number;
let perfilArtista1Id: number;
let perfilArtista2Id: number;

// Data no formato YYYY-MM-DD exigido por `createBookingSchema` (z.string().date())
function futureDateOnly(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

// Corpo de criação de evento — `horario_inicio`/`horario_fim` em formato HH:MM
// (createBookingSchema exige HH:MM; makeBookingData usa HH:MM:SS para o model)
function makeBookingBody(perfilEstabelecimentoId: number, daysAhead: number) {
  return makeBookingData(perfilEstabelecimentoId, {
    data_show: futureDateOnly(daysAhead),
    horario_inicio: '20:00',
    horario_fim: '23:00',
  });
}

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const estab1User = await UserModel.create(makeUserData({
    email: 'e2e-estab1@teste.com',
    nome_completo: 'Dono do Bar 1',
    roles: ['common_user', 'establishment_owner'],
    role: 'establishment_owner',
  }) as any);

  const estab2User = await UserModel.create(makeUserData({
    email: 'e2e-estab2@teste.com',
    nome_completo: 'Dono do Bar 2',
    roles: ['common_user', 'establishment_owner'],
    role: 'establishment_owner',
  }) as any);

  const artista1User = await UserModel.create(makeUserData({
    email: 'e2e-artista1@teste.com',
    nome_completo: 'Artista 1',
    roles: ['common_user', 'artist'],
    role: 'artist',
  }) as any);

  const artista2User = await UserModel.create(makeUserData({
    email: 'e2e-artista2@teste.com',
    nome_completo: 'Artista 2',
    roles: ['common_user', 'artist'],
    role: 'artist',
  }) as any);

  const perfilEstab1 = await EstablishmentProfileModel.create(
    makeEstablishmentData(estab1User.id, { nome_estabelecimento: 'Bar 1' }) as any
  );
  await EstablishmentProfileModel.create(
    makeEstablishmentData(estab2User.id, { nome_estabelecimento: 'Bar 2' }) as any
  );

  const perfilArtista1 = await ArtistProfileModel.create(
    makeArtistProfileData(artista1User.id, { nome_artistico: 'Artista 1' }) as any
  );
  const perfilArtista2 = await ArtistProfileModel.create(
    makeArtistProfileData(artista2User.id, { nome_artistico: 'Artista 2' }) as any
  );

  perfilEstab1Id = perfilEstab1.id;
  perfilArtista1Id = perfilArtista1.id;
  perfilArtista2Id = perfilArtista2.id;

  estab1Token = makeToken(estab1User.id, ['common_user', 'establishment_owner']);
  estab2Token = makeToken(estab2User.id, ['common_user', 'establishment_owner']);
  artista1Token = makeToken(artista1User.id, ['common_user', 'artist']);
  artista2Token = makeToken(artista2User.id, ['common_user', 'artist']);
});

afterAll(async () => {
  await sequelize.close();
});

describe('E2E — Fluxo criar evento → candidatar → aceitar', () => {

  describe('Fluxo feliz', () => {
    let eventoId: number;
    let aplicacaoId: number;
    let contratoId: number;

    it('estabelecimento cria um evento (POST /agendamentos)', async () => {
      // Arrange
      const body = makeBookingBody(perfilEstab1Id, 30);

      // Act
      const res = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(body);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      eventoId = res.body.id;
    });

    it('artista se candidata ao evento (POST /eventos)', async () => {
      // Arrange
      const body = { evento_id: eventoId, artista_id: perfilArtista1Id, valor_proposto: 1500 };

      // Act
      const res = await request(app)
        .post('/eventos')
        .set(authHeader(artista1Token))
        .send(body);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.aplicacao).toHaveProperty('status', 'pendente');
      aplicacaoId = res.body.aplicacao.id;
    });

    it('estabelecimento aceita a candidatura e gera contrato (PUT /eventos/:id/aceitar)', async () => {
      // Act
      const res = await request(app)
        .put(`/eventos/${aplicacaoId}/aceitar`)
        .set(authHeader(estab1Token))
        .send({});

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.aplicacao).toHaveProperty('status', 'aceito');
      expect(res.body.contrato).toBeDefined();
      contratoId = res.body.contrato.id;
    });

    it('contrato gerado aparece em GET /contratos/meus do artista', async () => {
      // Act
      const res = await request(app)
        .get('/contratos/meus')
        .set(authHeader(artista1Token));

      // Assert
      expect(res.statusCode).toBe(200);
      const ids = (res.body.data as Array<{ id: number }>).map((c) => c.id);
      expect(ids).toContain(contratoId);
    });
  });

  describe('Autorização', () => {
    let eventoId: number;
    let aplicacaoId: number;

    beforeAll(async () => {
      const body = makeBookingBody(perfilEstab1Id, 31);
      const eventoRes = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(body);
      eventoId = eventoRes.body.id;

      const aplicacaoRes = await request(app)
        .post('/eventos')
        .set(authHeader(artista2Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista2Id, valor_proposto: 1200 });
      aplicacaoId = aplicacaoRes.body.aplicacao.id;
    });

    it('retorna 403 quando o próprio artista tenta aceitar a candidatura', async () => {
      // Act
      const res = await request(app)
        .put(`/eventos/${aplicacaoId}/aceitar`)
        .set(authHeader(artista2Token))
        .send({});

      // Assert
      assertError(res.body, res.statusCode, 403);
    });

    it('retorna 403 quando um estabelecimento que não é dono do evento tenta aceitar', async () => {
      // Act
      const res = await request(app)
        .put(`/eventos/${aplicacaoId}/aceitar`)
        .set(authHeader(estab2Token))
        .send({});

      // Assert
      assertError(res.body, res.statusCode, 403);
    });
  });

  describe('Lock de concorrência', () => {
    it('apenas uma de duas candidaturas concorrentes ao mesmo evento é aceita', async () => {
      // Arrange — novo evento + 2 candidaturas pendentes de artistas distintos
      const bookingBody = makeBookingBody(perfilEstab1Id, 32);
      const eventoRes = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(bookingBody);
      const eventoId = eventoRes.body.id;

      const aplicacao1Res = await request(app)
        .post('/eventos')
        .set(authHeader(artista1Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista1Id, valor_proposto: 1000 });
      const aplicacao2Res = await request(app)
        .post('/eventos')
        .set(authHeader(artista2Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista2Id, valor_proposto: 1100 });

      const aplicacao1Id = aplicacao1Res.body.aplicacao.id;
      const aplicacao2Id = aplicacao2Res.body.aplicacao.id;

      // Act — estabelecimento tenta aceitar as duas candidaturas ao mesmo tempo
      const [r1, r2] = await Promise.all([
        request(app).put(`/eventos/${aplicacao1Id}/aceitar`).set(authHeader(estab1Token)).send({}),
        request(app).put(`/eventos/${aplicacao2Id}/aceitar`).set(authHeader(estab1Token)).send({}),
      ]);

      // Assert — exatamente uma 200 com contrato, a outra 409 (lock ocupado)
      const responses = [r1, r2];
      const accepted = responses.filter((r) => r.statusCode === 200);
      const conflicted = responses.filter((r) => r.statusCode === 409);

      expect(accepted).toHaveLength(1);
      expect(conflicted).toHaveLength(1);
      expect(accepted[0].body.contrato).toBeDefined();
      expect(conflicted[0].body.error).toContain('Outra candidatura está sendo processada');
    });
  });

});
