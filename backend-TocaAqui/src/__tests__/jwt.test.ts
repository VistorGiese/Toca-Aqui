// Configura variáveis de ambiente antes de qualquer import que chame env.ts
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.JWT_EXPIRES_IN = '1h';

import { generateToken, verifyToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';

describe('jwt utils', () => {
  const payload = { id: 42, email: 'user@test.com', role: 'artist' };

  describe('generateToken', () => {
    it('retorna uma string não vazia', () => {
      const token = generateToken(payload);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('token possui 3 partes separadas por ponto (header.payload.signature)', () => {
      const token = generateToken(payload);
      const partes = token.split('.');

      expect(partes).toHaveLength(3);
    });

    it('payload decodificado contém os campos fornecidos', () => {
      const token = generateToken(payload);
      const decoded: any = jwt.decode(token);

      expect(decoded.id).toBe(42);
      expect(decoded.email).toBe('user@test.com');
      expect(decoded.role).toBe('artist');
    });

    it('inclui campo exp no token', () => {
      const token = generateToken(payload);
      const decoded: any = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('verifyToken', () => {
    it('retorna o payload para um token válido', () => {
      const token = generateToken(payload);
      const decoded: any = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded.id).toBe(42);
      expect(decoded.email).toBe('user@test.com');
    });

    it('retorna null para token completamente inválido', () => {
      const result = verifyToken('token.invalido.aqui');

      expect(result).toBeNull();
    });

    it('retorna null para string vazia', () => {
      const result = verifyToken('');

      expect(result).toBeNull();
    });

    it('retorna null para token assinado com secret diferente', () => {
      const outroToken = jwt.sign(payload, 'outro-segredo-qualquer');
      const result = verifyToken(outroToken);

      expect(result).toBeNull();
    });

    it('retorna null para token expirado', () => {
      const expirado = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: -1 });
      const result = verifyToken(expirado);

      expect(result).toBeNull();
    });
  });
});
