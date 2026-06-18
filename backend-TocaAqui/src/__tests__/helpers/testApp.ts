import express, { Express } from 'express';
import BookingRoutes from '../../routes/BookingRoutes';
import BandApplicationRoutes from '../../routes/BandApplicationRoutes';
import ContractRoutes from '../../routes/ContractRoutes';
import { errorHandler } from '../../middleware/errorHandler';
import { traceIdMiddleware } from '../../middleware/traceId';

/**
 * App Express real (sem `listen`), reaproveitado pelos testes E2E e de
 * Comportamento (BDD) — monta as rotas do fluxo
 * "criar evento → artista aplica → estabelecimento aceita".
 */
export function buildE2EApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(traceIdMiddleware);
  app.use('/agendamentos', BookingRoutes);
  app.use('/eventos', BandApplicationRoutes);
  app.use('/contratos', ContractRoutes);
  app.use(errorHandler);
  return app;
}
