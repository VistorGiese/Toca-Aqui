import { applyBandSchema } from '../schemas/bandApplicationSchemas';

describe('applyBandSchema', () => {
  const validPayload = {
    evento_id: 10,
    valor_proposto: 350,
  };

  it('aceita payload válido com apenas campos obrigatórios', () => {
    // Arrange + Act
    const result = applyBandSchema.safeParse(validPayload);
    // Assert
    expect(result.success).toBe(true);
  });

  it('aceita payload válido com todos os campos opcionais preenchidos', () => {
    // Arrange
    const payload = { ...validPayload, banda_id: 1, mensagem: 'Topamos tocar!', artista_id: 2 };
    // Act
    const result = applyBandSchema.safeParse(payload);
    // Assert
    expect(result.success).toBe(true);
  });

  it('rejeita quando valor_proposto está ausente', () => {
    // Arrange
    const { valor_proposto, ...payload } = validPayload;
    // Act
    const result = applyBandSchema.safeParse(payload);
    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toContain('valor_proposto');
    }
  });

  it('rejeita quando valor_proposto é zero (não é positivo)', () => {
    // Arrange
    const payload = { ...validPayload, valor_proposto: 0 };
    // Act
    const result = applyBandSchema.safeParse(payload);
    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toContain('valor_proposto');
    }
  });

  it('rejeita quando valor_proposto é negativo', () => {
    // Arrange
    const payload = { ...validPayload, valor_proposto: -50 };
    // Act
    const result = applyBandSchema.safeParse(payload);
    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toContain('valor_proposto');
    }
  });

  it('rejeita quando evento_id está ausente', () => {
    // Arrange
    const { evento_id, ...payload } = validPayload;
    // Act
    const result = applyBandSchema.safeParse(payload);
    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toContain('evento_id');
    }
  });
});
