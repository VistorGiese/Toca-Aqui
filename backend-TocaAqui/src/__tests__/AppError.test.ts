import { AppError, notFound, badRequest, unauthorized } from '../errors/AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('cria erro com mensagem e statusCode', () => {
      const err = new AppError('algo falhou', 422);

      expect(err.message).toBe('algo falhou');
      expect(err.statusCode).toBe(422);
      expect(err.extra).toBeUndefined();
    });

    it('usa statusCode 500 como padrão', () => {
      const err = new AppError('erro genérico');

      expect(err.statusCode).toBe(500);
    });

    it('armazena extra quando fornecido', () => {
      const extra = { campo: 'email', valor: 'x' };
      const err = new AppError('erro', 400, extra);

      expect(err.extra).toEqual(extra);
    });

    it('é instância de Error', () => {
      const err = new AppError('teste', 400);

      expect(err).toBeInstanceOf(Error);
    });

    it('é instância de AppError após serialização/instanceof', () => {
      const err = new AppError('teste', 400);

      expect(err).toBeInstanceOf(AppError);
    });

    it('possui stack trace', () => {
      const err = new AppError('teste', 400);

      expect(err.stack).toBeDefined();
    });
  });

  describe('factory notFound', () => {
    it('cria AppError 404 com mensagem padrão', () => {
      const err = notFound();

      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Recurso não encontrado');
    });

    it('aceita mensagem customizada', () => {
      const err = notFound('Usuário não encontrado');

      expect(err.message).toBe('Usuário não encontrado');
    });
  });

  describe('factory badRequest', () => {
    it('cria AppError 400', () => {
      const err = badRequest('dados inválidos');

      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('dados inválidos');
    });

    it('propaga extra', () => {
      const extra = { conflito: true };
      const err = badRequest('conflito', extra);

      expect(err.extra).toEqual(extra);
    });
  });

  describe('factory unauthorized', () => {
    it('cria AppError 401 com mensagem padrão', () => {
      const err = unauthorized();

      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Não autorizado');
    });

    it('aceita mensagem customizada', () => {
      const err = unauthorized('Token expirado');

      expect(err.message).toBe('Token expirado');
    });
  });
});
