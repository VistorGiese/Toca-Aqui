/**
 * Teste de Comportamento (BDD) — Candidatura de artista a um evento
 *
 * Implementa os cenários de `features/candidatura-evento.feature` usando
 * jest-cucumber, reaproveitando a mesma infraestrutura dos testes E2E
 * (`buildE2EApp`, SQLite in-memory, fake Redis para o `LockService`, mocks
 * de notificação/email).
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
import path from 'path';
import request from 'supertest';
import { loadFeature, defineFeature } from 'jest-cucumber';
import sequelize from '../../config/database';
import '../../models/associations';
import UserModel from '../../models/UserModel';
import EstablishmentProfileModel from '../../models/EstablishmentProfileModel';
import ArtistProfileModel from '../../models/ArtistProfileModel';
import { buildE2EApp } from '../helpers/testApp';
import { makeToken, authHeader } from '../helpers/apiHelpers';
import {
  makeUserData,
  makeEstablishmentData,
  makeArtistProfileData,
  makeBookingData,
} from '../helpers/factories';

const feature = loadFeature(path.join(__dirname, 'features/candidatura-evento.feature'));

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

defineFeature(feature, (test) => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const estab1User = await UserModel.create(makeUserData({
      email: 'bdd-estab1@teste.com',
      nome_completo: 'Dono do Bar 1',
      roles: ['common_user', 'establishment_owner'],
      role: 'establishment_owner',
    }) as any);

    const estab2User = await UserModel.create(makeUserData({
      email: 'bdd-estab2@teste.com',
      nome_completo: 'Dono do Bar 2',
      roles: ['common_user', 'establishment_owner'],
      role: 'establishment_owner',
    }) as any);

    const artista1User = await UserModel.create(makeUserData({
      email: 'bdd-artista1@teste.com',
      nome_completo: 'Artista 1',
      roles: ['common_user', 'artist'],
      role: 'artist',
    }) as any);

    const artista2User = await UserModel.create(makeUserData({
      email: 'bdd-artista2@teste.com',
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

  test('Artista se candidata e o estabelecimento aceita', ({ given, and, when, then }) => {
    let eventoId: number;
    let aplicacaoId: number;
    let response: request.Response;

    given('que existe um estabelecimento com um evento aberto para candidaturas', async () => {
      const res = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(makeBookingBody(perfilEstab1Id, 40));

      expect(res.statusCode).toBe(201);
      eventoId = res.body.id;
    });

    and('existe um artista cadastrado', () => {
      expect(perfilArtista1Id).toBeDefined();
    });

    when('o artista se candidata ao evento', async () => {
      response = await request(app)
        .post('/eventos')
        .set(authHeader(artista1Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista1Id, valor_proposto: 1500 });
    });

    then('a candidatura é criada com status "pendente"', () => {
      expect(response.statusCode).toBe(201);
      expect(response.body.aplicacao).toHaveProperty('status', 'pendente');
      aplicacaoId = response.body.aplicacao.id;
    });

    when('o estabelecimento aceita a candidatura', async () => {
      response = await request(app)
        .put(`/eventos/${aplicacaoId}/aceitar`)
        .set(authHeader(estab1Token))
        .send({});
    });

    then('a candidatura passa para o status "aceito"', () => {
      expect(response.statusCode).toBe(200);
      expect(response.body.aplicacao).toHaveProperty('status', 'aceito');
    });

    and('um contrato é gerado para o evento', () => {
      expect(response.body.contrato).toBeDefined();
    });
  });

  test('Estabelecimento não pode aceitar candidatura de um evento que não é seu', ({ given, when, then }) => {
    let aplicacaoId: number;
    let response: request.Response;

    given('que existe uma candidatura pendente para o evento de outro estabelecimento', async () => {
      const eventoRes = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(makeBookingBody(perfilEstab1Id, 41));
      const eventoId = eventoRes.body.id;

      const aplicacaoRes = await request(app)
        .post('/eventos')
        .set(authHeader(artista2Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista2Id, valor_proposto: 1200 });
      aplicacaoId = aplicacaoRes.body.aplicacao.id;
    });

    when('um estabelecimento diferente tenta aceitar essa candidatura', async () => {
      response = await request(app)
        .put(`/eventos/${aplicacaoId}/aceitar`)
        .set(authHeader(estab2Token))
        .send({});
    });

    then('a resposta é "Acesso negado" com status 403', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Acesso Negado');
    });
  });

  test('Duas candidaturas concorrentes ao mesmo evento — apenas uma é aceita', ({ given, when, then, and }) => {
    let aplicacao1Id: number;
    let aplicacao2Id: number;
    let responses: request.Response[];

    given('que existem duas candidaturas pendentes para o mesmo evento', async () => {
      const eventoRes = await request(app)
        .post('/agendamentos')
        .set(authHeader(estab1Token))
        .send(makeBookingBody(perfilEstab1Id, 42));
      const eventoId = eventoRes.body.id;

      const aplicacao1Res = await request(app)
        .post('/eventos')
        .set(authHeader(artista1Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista1Id, valor_proposto: 1000 });
      const aplicacao2Res = await request(app)
        .post('/eventos')
        .set(authHeader(artista2Token))
        .send({ evento_id: eventoId, artista_id: perfilArtista2Id, valor_proposto: 1100 });

      aplicacao1Id = aplicacao1Res.body.aplicacao.id;
      aplicacao2Id = aplicacao2Res.body.aplicacao.id;
    });

    when('o estabelecimento tenta aceitar as duas candidaturas ao mesmo tempo', async () => {
      responses = await Promise.all([
        request(app).put(`/eventos/${aplicacao1Id}/aceitar`).set(authHeader(estab1Token)).send({}),
        request(app).put(`/eventos/${aplicacao2Id}/aceitar`).set(authHeader(estab1Token)).send({}),
      ]);
    });

    then('apenas uma candidatura é aceita com sucesso', () => {
      const accepted = responses.filter((r) => r.statusCode === 200);
      expect(accepted).toHaveLength(1);
      expect(accepted[0].body.contrato).toBeDefined();
    });

    and('a outra recebe um erro de conflito com status 409', () => {
      const conflicted = responses.filter((r) => r.statusCode === 409);
      expect(conflicted).toHaveLength(1);
      expect(conflicted[0].body.error).toContain('Outra candidatura está sendo processada');
    });
  });
});
