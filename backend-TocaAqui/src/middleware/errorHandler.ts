import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.message };
    if (err.extra) Object.assign(body, err.extra);
    res.status(err.statusCode).json(body);
    return;
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      error: 'Dados inválidos',
      ...(env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
    return;
  }


  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }


  if (err.name === 'MulterError') {
    res.status(400).json({
      error: 'Erro no upload de arquivo',
      ...(env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
};


export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) => (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
