


export function assertSuccessResponse(body: unknown, expectedFields: string[]): void {
  expect(body).toBeDefined();
  expectedFields.forEach(field => {
    expect(body).toHaveProperty(field);
  });
}

export function assertErrorResponse(body: Record<string, unknown>, expectedCode?: string): void {
  expect(body).toHaveProperty('error');
  if (expectedCode) {
    expect(String(body.error)).toContain(expectedCode);
  }
}

export function assertPaginatedResponse(body: unknown): void {
  expect(body).toHaveProperty('data');
  expect(Array.isArray((body as Record<string, unknown>).data)).toBe(true);
}

export function assertHasFields(body: unknown, fields: string[]): void {
  fields.forEach(field => {
    expect(body).toHaveProperty(field);
  });
}

export function assertTimestamp(value: unknown): void {
  expect(typeof value).toBe('string');
  expect(new Date(value as string).getTime()).not.toBeNaN();
}
