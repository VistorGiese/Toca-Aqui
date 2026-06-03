/**
 * Testes Integrados — Contratos (CRUD completo)
 *
 * Diferente dos testes unitários (que mocam o ContractService),
 * estes testes exercitam a pilha completa:
 *   HTTP (supertest) → Controller → ContractService → Sequelize → SQLite in-memory
 *
 * Redis é mockado para evitar dependência de infraestrutura externa.
 * NotificationService é mockado para isolar efeitos colaterais.
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

// Redis — nunca lista tokens como revogados, métodos de cache são no-op
jest.mock('../../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    setex: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
    del: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue(true),
  },
}));

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
import express from 'express';
import sequelize from '../../config/database';
import '../../models/associations'; // registra todos os models + associations no SQLite
import UserModel from '../../models/UserModel';
import EstablishmentProfileModel from '../../models/EstablishmentProfileModel';
import ArtistProfileModel from '../../models/ArtistProfileModel';
import BookingModel from '../../models/BookingModel';
import ContractModel, { ContractStatus } from '../../models/ContractModel';
import ContractRoutes from '../../routes/ContractRoutes';
import { errorHandler } from '../../middleware/errorHandler';
import { traceIdMiddleware } from '../../middleware/traceId';
import { makeToken, authHeader, assertList, assertError } from '../helpers/apiHelpers';
import {
  makeUserData,
  makeEstablishmentData,
  makeArtistProfileData,
  makeBookingData,
  makeContractData,
} from '../helpers/factories';
import BandApplicationModel, { ApplicationStatus } from '../../models/BandApplicationModel';

// ── App de teste ───────────────────────────────────────────────────────────
const testApp = express();
testApp.use(express.json());
testApp.use(traceIdMiddleware);
testApp.use('/contratos', ContractRoutes);
testApp.use(errorHandler);

// ── IDs de contexto (preenchidos em beforeAll) ─────────────────────────────
let estabOwnerUserId: number;
let artistUserId: number;
let outsiderUserId: number;
let estabelecimentoId: number;
let artistaId: number;
let eventoId: number;
let aplicacaoId: number;
let contratoId: number;

// ── Setup ──────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // Cria todas as tabelas no SQLite in-memory
  await sequelize.sync({ force: true });

  // Arrange — criar usuários
  const estabOwner = await UserModel.create(makeUserData({
    email: 'estab@teste.com',
    nome_completo: 'Dono do Bar',
    roles: ['common_user', 'establishment_owner'],
    role: 'establishment_owner',
  }) as any);
  estabOwnerUserId = estabOwner.id;

  const artist = await UserModel.create(makeUserData({
    email: 'artista@teste.com',
    nome_completo: 'Artista Rock',
    roles: ['common_user', 'artist'],
    role: 'artist',
  }) as any);
  artistUserId = artist.id;

  const outsider = await UserModel.create(makeUserData({
    email: 'outsider@teste.com',
    nome_completo: 'Usuário Sem Contrato',
  }) as any);
  outsiderUserId = outsider.id;

  // Arrange — criar perfis
  const estab = await EstablishmentProfileModel.create(
    makeEstablishmentData(estabOwnerUserId) as any
  );
  estabelecimentoId = estab.id;

  const artista = await ArtistProfileModel.create(
    makeArtistProfileData(artistUserId) as any
  );
  artistaId = artista.id;

  // Arrange — criar evento
  const evento = await BookingModel.create(
    makeBookingData(estabelecimentoId) as any
  );
  eventoId = evento.id;

  // Arrange — criar candidatura (FK real para evitar notNull violation)
  const aplicacao = await BandApplicationModel.create({
    evento_id: eventoId,
    artista_id: artistaId,
    status: ApplicationStatus.ACEITO,
  } as any);
  aplicacaoId = aplicacao.id;

  // Arrange — criar contrato com FK real
  const contrato = await ContractModel.create(
    makeContractData(eventoId, estabelecimentoId, {
      aplicacao_id: aplicacaoId,
      artista_id: artistaId,
    }) as any
  ).catch((e: Error) => { throw new Error(`ContractModel.create falhou: ${e.message}`); });
  contratoId = (contrato as ContractModel).id;
});

afterAll(async () => {
  await sequelize.close();
});

// ── Testes ─────────────────────────────────────────────────────────────────

describe('Contratos — CRUD integrado', () => {

  // ── GET /contratos/meus ────────────────────────────────────────────────

  describe('GET /contratos/meus', () => {

    it('deve retornar 401 quando requisição não tem token', async () => {
      // Arrange
      // (sem token)

      // Act
      const res = await request(testApp).get('/contratos/meus');

      // Assert
      assertError(res.body, res.statusCode, 401);
    });

    it('deve retornar lista vazia quando usuário não tem contratos', async () => {
      // Arrange
      const token = makeToken(outsiderUserId);

      // Act
      const res = await request(testApp)
        .get('/contratos/meus')
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      assertList(res.body);
      expect(res.body.data).toHaveLength(0);
    });

    it('deve retornar contratos quando usuário é dono do estabelecimento', async () => {
      // Arrange
      const token = makeToken(estabOwnerUserId, ['common_user', 'establishment_owner']);

      // Act
      const res = await request(testApp)
        .get('/contratos/meus')
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      assertList(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('deve retornar contratos quando usuário é artista do contrato', async () => {
      // Arrange
      const token = makeToken(artistUserId, ['common_user', 'artist']);

      // Act
      const res = await request(testApp)
        .get('/contratos/meus')
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      assertList(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });

  // ── GET /contratos/:id ─────────────────────────────────────────────────

  describe('GET /contratos/:id', () => {

    it('deve retornar contrato quando usuário é o contratante (estabelecimento)', async () => {
      // Arrange
      const token = makeToken(estabOwnerUserId, ['common_user', 'establishment_owner']);

      // Act
      const res = await request(testApp)
        .get(`/contratos/${contratoId}`)
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', contratoId);
      expect(res.body).toHaveProperty('status');
      expect(res.headers['x-trace-id']).toBeDefined();
    });

    it('deve retornar contrato quando usuário é o contratado (artista)', async () => {
      // Arrange
      const token = makeToken(artistUserId, ['common_user', 'artist']);

      // Act
      const res = await request(testApp)
        .get(`/contratos/${contratoId}`)
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', contratoId);
    });

    it('deve retornar 403 quando contrato não existe (sem acesso confirmado)', async () => {
      // Arrange — usuário sem vínculo com contrato inexistente recebe 403 (segurança: não revela existência)
      const token = makeToken(outsiderUserId);
      const idInexistente = 99999;

      // Act
      const res = await request(testApp)
        .get(`/contratos/${idInexistente}`)
        .set(authHeader(token));

      // Assert
      assertError(res.body, res.statusCode, 403);
    });

    it('deve retornar 403 quando usuário não faz parte do contrato', async () => {
      // Arrange
      const token = makeToken(outsiderUserId);

      // Act
      const res = await request(testApp)
        .get(`/contratos/${contratoId}`)
        .set(authHeader(token));

      // Assert
      assertError(res.body, res.statusCode, 403);
    });

  });

  // ── PUT /contratos/:id/aceitar ────────────────────────────────────────

  describe('PUT /contratos/:id/aceitar', () => {

    it('deve aceitar contrato quando artista (contratado) confirma', async () => {
      // Arrange
      const token = makeToken(artistUserId, ['common_user', 'artist']);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${contratoId}/aceitar`)
        .set(authHeader(token));

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('aceite_contratado', true);
    });

    it('deve retornar 400 quando artista tenta aceitar novamente um contrato já aceito por ele', async () => {
      // Arrange — artista já aceitou no teste anterior
      const token = makeToken(artistUserId, ['common_user', 'artist']);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${contratoId}/aceitar`)
        .set(authHeader(token));

      // Assert
      assertError(res.body, res.statusCode, 400);
    });

    it('deve retornar 403 quando usuário sem relação com o contrato tenta aceitar', async () => {
      // Arrange
      const token = makeToken(outsiderUserId);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${contratoId}/aceitar`)
        .set(authHeader(token));

      // Assert
      assertError(res.body, res.statusCode, 403);
    });

  });

  // ── PUT /contratos/:id/cancelar ───────────────────────────────────────

  describe('PUT /contratos/:id/cancelar', () => {

    let cancelContratoId: number;

    beforeAll(async () => {
      // Arrange — cria candidatura e contrato novos para não interferir nos outros testes
      const aplicacaoCancel = await BandApplicationModel.create({
        evento_id: eventoId,
        artista_id: artistaId,
        status: ApplicationStatus.ACEITO,
      } as any);
      const contrato = await ContractModel.create(
        makeContractData(eventoId, estabelecimentoId, {
          aplicacao_id: aplicacaoCancel.id,
          artista_id: artistaId,
          status: ContractStatus.AGUARDANDO_ACEITE,
        }) as any
      );
      cancelContratoId = contrato.id;
    });

    it('deve cancelar contrato quando estabelecimento (contratante) solicita com motivo', async () => {
      // Arrange
      const token = makeToken(estabOwnerUserId, ['common_user', 'establishment_owner']);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${cancelContratoId}/cancelar`)
        .set(authHeader(token))
        .send({ motivo: 'Evento cancelado por motivo de força maior' });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.contrato).toHaveProperty('status', ContractStatus.CANCELADO);
      expect(res.body).toHaveProperty('penalidade_percentual');
    });

    it('deve retornar 400 quando tenta cancelar contrato já cancelado', async () => {
      // Arrange — mesmo contrato cancelado no teste anterior
      const token = makeToken(estabOwnerUserId, ['common_user', 'establishment_owner']);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${cancelContratoId}/cancelar`)
        .set(authHeader(token))
        .send({ motivo: 'Tentativa de cancelar novamente' });

      // Assert
      assertError(res.body, res.statusCode, 400);
    });

    it('deve retornar 403 quando usuário não relacionado tenta cancelar', async () => {
      // Arrange — cria candidatura e contrato para testar acesso negado
      const aplicacaoExtra = await BandApplicationModel.create({
        evento_id: eventoId,
        artista_id: artistaId,
        status: ApplicationStatus.ACEITO,
      } as any);
      const outroContrato = await ContractModel.create(
        makeContractData(eventoId, estabelecimentoId, {
          aplicacao_id: aplicacaoExtra.id,
          artista_id: artistaId,
        }) as any
      );
      const token = makeToken(outsiderUserId);

      // Act
      const res = await request(testApp)
        .put(`/contratos/${outroContrato.id}/cancelar`)
        .set(authHeader(token))
        .send({ motivo: 'Tentativa não autorizada' });

      // Assert
      assertError(res.body, res.statusCode, 403);
    });

  });

});
