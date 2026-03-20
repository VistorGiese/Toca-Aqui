import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      }));
      return res.status(400).json({ error: 'Dados inválidos', detalhes: errors });
    }

    req.body = result.data;
    next();
  };
