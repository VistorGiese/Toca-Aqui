import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const showDetails = process.env.NODE_ENV !== 'production';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      error: 'Dados inválidos',
      ...(showDetails ? { details: err.message } : {}),
    });
    return;
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  console.error('[Social Service] Unhandled Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
};

export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) => (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
