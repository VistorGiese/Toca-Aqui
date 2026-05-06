export class AppError extends Error {
  public readonly statusCode: number;
  public readonly extra?: Record<string, unknown>;

  constructor(message: string, statusCode = 500, extra?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const notFound = (message = 'Recurso não encontrado') => new AppError(message, 404);
export const badRequest = (message: string, extra?: Record<string, unknown>) => new AppError(message, 400, extra);
export const unauthorized = (message = 'Não autorizado') => new AppError(message, 401);
