import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Injeta um TraceID único em cada requisição.
 * Reutiliza o header `x-trace-id` se já vier do cliente (ex: frontend ou API gateway).
 * O traceId fica disponível em `req.traceId` para logs e respostas.
 */
export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}
