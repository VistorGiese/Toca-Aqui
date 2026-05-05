import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

// Instâncias isoladas para testes — limites fixos, independentes do NODE_ENV
const makeAuthLimiter = () => rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

const makeUploadLimiter = () => rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos uploads em pouco tempo. Tente novamente em 15 minutos.' },
});

const makeAdminLimiter = () => rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições administrativas. Tente novamente em 15 minutos.' },
});

const hit = async (app: express.Express, path: string, times: number) => {
  let res = await request(app).post(path);
  for (let i = 1; i < times; i += 1) {
    res = await request(app).post(path);
  }
  return res;
};

describe('rate limiter middlewares', () => {
  it('bloqueia autenticação após 10 tentativas na janela', async () => {
    const app = express();
    app.post('/auth', makeAuthLimiter(), (_req, res) => res.status(200).json({ ok: true }));

    const allowed = await hit(app, '/auth', 10);
    expect(allowed.status).toBe(200);

    const blocked = await request(app).post('/auth');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty('error');
  });

  it('bloqueia uploads após 30 tentativas na janela', async () => {
    const app = express();
    app.post('/upload', makeUploadLimiter(), (_req, res) => res.status(200).json({ ok: true }));

    const allowed = await hit(app, '/upload', 30);
    expect(allowed.status).toBe(200);

    const blocked = await request(app).post('/upload');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty('error');
  });

  it('bloqueia endpoints admin após 60 tentativas na janela', async () => {
    const app = express();
    app.post('/admin', makeAdminLimiter(), (_req, res) => res.status(200).json({ ok: true }));

    const allowed = await hit(app, '/admin', 60);
    expect(allowed.status).toBe(200);

    const blocked = await request(app).post('/admin');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty('error');
  });
});
