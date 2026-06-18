/**
 * Seed para os testes de carga (k6) — popula o MySQL do `docker-compose`
 * (porta 3307) com dados para os scripts `flow-throughput.js` e
 * `lock-contention.js`, e grava os JSONs consumidos por eles em
 * `load-tests/seed-data/`.
 *
 * Uso: `npm run load:seed` (requer `docker-compose up -d` rodando).
 */

// ── Env vars — devem estar antes de qualquer import de config/models ──────
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3307';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import sequelize from '../src/config/database';
import '../src/models/associations';
import UserModel from '../src/models/UserModel';
import EstablishmentProfileModel from '../src/models/EstablishmentProfileModel';
import ArtistProfileModel from '../src/models/ArtistProfileModel';
import BookingModel from '../src/models/BookingModel';
import BandApplicationModel from '../src/models/BandApplicationModel';
import {
  makeUserData,
  makeEstablishmentData,
  makeArtistProfileData,
  makeBookingData,
  makeBandApplicationData,
} from '../src/__tests__/helpers/factories';

const N_THROUGHPUT_PAIRS = 5;
const M_LOCK_APPLICATIONS = 8;

function makeToken(userId: number, roles: string[]): string {
  return jwt.sign({ id: userId, email: `user${userId}@teste.com`, roles }, env.JWT_SECRET, { expiresIn: '1h' });
}

function futureDate(daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

async function seedThroughputPairs() {
  const pairs: Array<{
    estabToken: string;
    perfilEstabelecimentoId: number;
    artistToken: string;
    artistaId: number;
  }> = [];

  for (let i = 0; i < N_THROUGHPUT_PAIRS; i++) {
    const estabUser = await UserModel.create(makeUserData({
      email: `load-estab-${Date.now()}-${i}@teste.com`,
      nome_completo: `Dono Carga ${i}`,
      roles: ['common_user', 'establishment_owner'],
      role: 'establishment_owner',
    }) as any);
    const perfilEstab = await EstablishmentProfileModel.create(
      makeEstablishmentData(estabUser.id, { nome_estabelecimento: `Bar Carga ${i}` }) as any
    );

    const artistaUser = await UserModel.create(makeUserData({
      email: `load-artista-${Date.now()}-${i}@teste.com`,
      nome_completo: `Artista Carga ${i}`,
      roles: ['common_user', 'artist'],
      role: 'artist',
    }) as any);
    const perfilArtista = await ArtistProfileModel.create(
      makeArtistProfileData(artistaUser.id, { nome_artistico: `Artista Carga ${i}` }) as any
    );

    pairs.push({
      estabToken: makeToken(estabUser.id, ['common_user', 'establishment_owner']),
      perfilEstabelecimentoId: perfilEstab.id,
      artistToken: makeToken(artistaUser.id, ['common_user', 'artist']),
      artistaId: perfilArtista.id,
    });
  }

  return pairs;
}

async function seedLockContention() {
  const estabUser = await UserModel.create(makeUserData({
    email: `load-lock-estab-${Date.now()}@teste.com`,
    nome_completo: 'Dono Carga Lock',
    roles: ['common_user', 'establishment_owner'],
    role: 'establishment_owner',
  }) as any);
  const perfilEstab = await EstablishmentProfileModel.create(
    makeEstablishmentData(estabUser.id, { nome_estabelecimento: 'Bar Carga Lock' }) as any
  );

  const evento = await BookingModel.create(
    makeBookingData(perfilEstab.id, {
      titulo_evento: 'Evento de Carga — Lock',
      data_show: futureDate(180),
    }) as any
  );

  const aplicacaoIds: number[] = [];
  for (let i = 0; i < M_LOCK_APPLICATIONS; i++) {
    const artistaUser = await UserModel.create(makeUserData({
      email: `load-lock-artista-${Date.now()}-${i}@teste.com`,
      nome_completo: `Artista Carga Lock ${i}`,
      roles: ['common_user', 'artist'],
      role: 'artist',
    }) as any);
    const perfilArtista = await ArtistProfileModel.create(
      makeArtistProfileData(artistaUser.id, { nome_artistico: `Artista Carga Lock ${i}` }) as any
    );

    const aplicacao = await BandApplicationModel.create(
      makeBandApplicationData(evento.id, { artista_id: perfilArtista.id, valor_proposto: 1000 + i }) as any
    );
    aplicacaoIds.push(aplicacao.id);
  }

  return {
    estabToken: makeToken(estabUser.id, ['common_user', 'establishment_owner']),
    aplicacaoIds,
  };
}

async function main() {
  await sequelize.authenticate();
  console.log('[seed] Conectado ao banco de dados.');

  const outDir = path.join(__dirname, 'seed-data');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[seed] Gerando ${N_THROUGHPUT_PAIRS} pares estabelecimento/artista (flow-throughput)...`);
  const throughputPairs = await seedThroughputPairs();
  fs.writeFileSync(path.join(outDir, 'throughput.json'), JSON.stringify(throughputPairs, null, 2));

  console.log(`[seed] Gerando 1 evento + ${M_LOCK_APPLICATIONS} candidaturas pendentes (lock-contention)...`);
  const lockContention = await seedLockContention();
  fs.writeFileSync(path.join(outDir, 'lock-contention.json'), JSON.stringify(lockContention, null, 2));

  console.log('[seed] Concluído:');
  console.log(`  - ${path.join(outDir, 'throughput.json')} (${throughputPairs.length} pares)`);
  console.log(`  - ${path.join(outDir, 'lock-contention.json')} (${lockContention.aplicacaoIds.length} candidaturas)`);

  await sequelize.close();
}

main().catch((err) => {
  console.error('[seed] Erro ao gerar dados de carga:', err);
  process.exit(1);
});
