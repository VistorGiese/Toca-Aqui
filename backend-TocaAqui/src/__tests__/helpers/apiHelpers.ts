import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

/**
 * Gera token JWT válido para usar nos testes integrados.
 */
export function makeToken(userId: number, roles: string[] = ['common_user']): string {
  return jwt.sign(
    { id: userId, email: `user${userId}@teste.com`, roles },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Header de autorização pronto para uso com supertest.
 */
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Valida que a resposta tem status 200 e campo `data` ou corpo direto.
 */
export function assertSuccess(body: unknown, statusCode: number, expectedStatus = 200): void {
  expect(statusCode).toBe(expectedStatus);
  expect(body).toBeDefined();
}

/**
 * Valida resposta de erro com campo `error`.
 */
export function assertError(body: Record<string, unknown>, statusCode: number, expectedStatus: number): void {
  expect(statusCode).toBe(expectedStatus);
  expect(body).toHaveProperty('error');
}

/**
 * Valida que a resposta é uma lista (array ou { data: array }).
 */
export function assertList(body: unknown): void {
  if (Array.isArray(body)) {
    expect(Array.isArray(body)).toBe(true);
  } else {
    expect(body).toHaveProperty('data');
    expect(Array.isArray((body as Record<string, unknown>).data)).toBe(true);
  }
}
