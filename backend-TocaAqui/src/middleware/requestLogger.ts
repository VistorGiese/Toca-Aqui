import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { metricsService } from '../services/MetricsService';


export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    const meta = {
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    const normalizedRoute = `${req.method} ${req.route?.path ?? req.path}`;
    metricsService.record(normalizedRoute, durationMs, res.statusCode);

    if (res.statusCode >= 500) {
      logger.error('request', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('request', meta);
    } else {
      logger.info('request', meta);
    }
  });

  next();
}
