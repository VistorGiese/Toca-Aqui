import { registroSchema, loginSchema, createEstablishmentProfileSchema, createArtistProfileSchema } from '../schemas/userSchemas';

describe('registroSchema', () => {
  const base = { nome_completo: 'João Silva', email: 'joao@email.com', senha: 'Senha@123' };

  it('aceita dados válidos', () => {
    expect(registroSchema.safeParse(base).success).toBe(true);
  });

  it('normaliza email para lowercase', () => {
    const result = registroSchema.safeParse({ ...base, email: 'JOAO@EMAIL.COM' });
    expect(result.success && result.data.email).toBe('joao@email.com');
  });

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = registroSchema.safeParse({ ...base, nome_completo: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = registroSchema.safeParse({ ...base, email: 'nao-e-email' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = registroSchema.safeParse({ ...base, senha: '123' });
    expect(result.success).toBe(false);
  });

  it('aceita tipo_usuario válido', () => {
    const result = registroSchema.safeParse({ ...base, tipo_usuario: 'artist' });
    expect(result.success).toBe(true);
  });

  it('rejeita tipo_usuario inválido', () => {
    const result = registroSchema.safeParse({ ...base, tipo_usuario: 'superadmin' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('aceita dados válidos', () => {
    const result = loginSchema.safeParse({ email: 'joao@email.com', senha: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = loginSchema.safeParse({ email: 'invalido', senha: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'joao@email.com', senha: '' });
    expect(result.success).toBe(false);
  });
});

describe('createEstablishmentProfileSchema', () => {
  const base = {
    nome_estabelecimento: 'Bar do João',
    generos_musicais: 'rock, jazz',
    horario_abertura: '18:00',
    horario_fechamento: '02:00',
    endereco_id: 1,
    telefone_contato: '11999999999',
  };

  it('aceita dados válidos', () => {
    expect(createEstablishmentProfileSchema.safeParse(base).success).toBe(true);
  });

  it('aplica default bar ao tipo_estabelecimento', () => {
    const result = createEstablishmentProfileSchema.safeParse(base);
    expect(result.success && result.data.tipo_estabelecimento).toBe('bar');
  });

  it('rejeita endereco_id não numérico', () => {
    const result = createEstablishmentProfileSchema.safeParse({ ...base, endereco_id: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejeita telefone muito curto', () => {
    const result = createEstablishmentProfileSchema.safeParse({ ...base, telefone_contato: '123' });
    expect(result.success).toBe(false);
  });
});

describe('createArtistProfileSchema', () => {
  const base = { nome_artistico: 'DJ Top' };

  it('aceita dados mínimos', () => {
    expect(createArtistProfileSchema.safeParse(base).success).toBe(true);
  });

  it('aplica defaults para arrays e experiência', () => {
    const result = createArtistProfileSchema.safeParse(base);
    expect(result.success && result.data.instrumentos).toEqual([]);
    expect(result.success && result.data.generos).toEqual([]);
    expect(result.success && result.data.anos_experiencia).toBe(0);
  });

  it('rejeita url_portfolio inválida', () => {
    const result = createArtistProfileSchema.safeParse({ ...base, url_portfolio: 'nao-e-url' });
    expect(result.success).toBe(false);
  });

  it('aceita url_portfolio vazia', () => {
    const result = createArtistProfileSchema.safeParse({ ...base, url_portfolio: '' });
    expect(result.success).toBe(true);
  });
});
