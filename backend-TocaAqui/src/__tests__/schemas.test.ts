import { registroSchema, loginSchema, createEstablishmentProfileSchema, createArtistProfileSchema } from '../schemas/userSchemas';
import { createBandSchema, inviteMemberSchema, respondInvitationSchema } from '../schemas/bandSchemas';
import { createBookingSchema, updateBookingSchema } from '../schemas/bookingSchemas';
import { createAddressSchema, updateAddressSchema } from '../schemas/addressSchemas';
import { applyBandSchema } from '../schemas/bandApplicationSchemas';

// ─── userSchemas ──────────────────────────────────────────────────────────────

describe('registroSchema', () => {
  const valid = { nome_completo: 'João Silva', email: 'joao@email.com', senha: 'Senha@123' };

  it('aceita dados válidos', () => {
    expect(registroSchema.safeParse(valid).success).toBe(true);
  });

  it('normaliza email para lowercase', () => {
    const result = registroSchema.safeParse({ ...valid, email: 'JOAO@EMAIL.COM' });
    expect(result.success && result.data.email).toBe('joao@email.com');
  });

  it('rejeita email inválido', () => {
    const result = registroSchema.safeParse({ ...valid, email: 'nao-é-email' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha menor que 8 caracteres', () => {
    const result = registroSchema.safeParse({ ...valid, senha: '123' });
    expect(result.success).toBe(false);
  });

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = registroSchema.safeParse({ ...valid, nome_completo: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejeita se nome_completo estiver ausente', () => {
    const { nome_completo, ...sem } = valid;
    expect(registroSchema.safeParse(sem).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', senha: '123456' }).success).toBe(true);
  });

  it('rejeita email inválido', () => {
    expect(loginSchema.safeParse({ email: 'invalido', senha: '123' }).success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', senha: '' }).success).toBe(false);
  });
});

describe('createArtistProfileSchema', () => {
  const valid = { nome_artistico: 'DJ Teste' };

  it('aceita dados mínimos válidos', () => {
    expect(createArtistProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('aplica defaults a campos opcionais', () => {
    const result = createArtistProfileSchema.safeParse(valid);
    expect(result.success && result.data.instrumentos).toEqual([]);
    expect(result.success && result.data.anos_experiencia).toBe(0);
  });

  it('rejeita url_portfolio malformada', () => {
    const result = createArtistProfileSchema.safeParse({ ...valid, url_portfolio: 'nao-é-url' });
    expect(result.success).toBe(false);
  });

  it('aceita url_portfolio vazia (string vazia)', () => {
    const result = createArtistProfileSchema.safeParse({ ...valid, url_portfolio: '' });
    expect(result.success).toBe(true);
  });
});

// ─── addressSchemas ───────────────────────────────────────────────────────────

describe('createAddressSchema', () => {
  const valid = { rua: 'Rua das Flores', numero: '42', bairro: 'Centro', cidade: 'São Paulo', estado: 'sp', cep: '01310-100' };

  it('aceita endereço válido', () => {
    expect(createAddressSchema.safeParse(valid).success).toBe(true);
  });

  it('converte estado para maiúsculo', () => {
    const result = createAddressSchema.safeParse(valid);
    expect(result.success && result.data.estado).toBe('SP');
  });

  it('rejeita estado com mais de 2 caracteres', () => {
    expect(createAddressSchema.safeParse({ ...valid, estado: 'SPP' }).success).toBe(false);
  });

  it('aceita CEP em qualquer formato de string (sem validação de padrão)', () => {
    expect(createAddressSchema.safeParse({ ...valid, cep: '1234' }).success).toBe(true);
  });

  it('aceita CEP sem hífen', () => {
    expect(createAddressSchema.safeParse({ ...valid, cep: '01310100' }).success).toBe(true);
  });

  it('updateAddressSchema aceita objeto parcial', () => {
    expect(updateAddressSchema.safeParse({ cidade: 'Campinas' }).success).toBe(true);
  });
});

// ─── bookingSchemas ───────────────────────────────────────────────────────────

describe('createBookingSchema', () => {
  const valid = {
    titulo_evento: 'Show de Rock',
    data_show: '2026-06-15',
    perfil_estabelecimento_id: 1,
    horario_inicio: '20:00',
    horario_fim: '23:00',
  };

  it('aceita booking válido', () => {
    expect(createBookingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita data em formato errado', () => {
    expect(createBookingSchema.safeParse({ ...valid, data_show: '15/06/2026' }).success).toBe(false);
  });

  it('rejeita horario_inicio em formato errado', () => {
    expect(createBookingSchema.safeParse({ ...valid, horario_inicio: '8h' }).success).toBe(false);
  });

  it('aceita horario_fim anterior ao horario_inicio (permite shows que cruzam meia-noite)', () => {
    const result = createBookingSchema.safeParse({ ...valid, horario_inicio: '23:00', horario_fim: '20:00' });
    expect(result.success).toBe(true);
  });

  it('rejeita horario_fim igual ao horario_inicio', () => {
    const result = createBookingSchema.safeParse({ ...valid, horario_inicio: '20:00', horario_fim: '20:00' });
    expect(result.success).toBe(false);
  });

  it('updateBookingSchema aceita objeto parcial', () => {
    expect(updateBookingSchema.safeParse({ titulo_evento: 'Novo Nome' }).success).toBe(true);
  });

  it('rejeita quando cache_maximo < cache_minimo', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      cache_minimo: 500,
      cache_maximo: 200,
    });
    expect(result.success).toBe(false);
  });

  it('aceita quando cache_maximo >= cache_minimo', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      cache_minimo: 200,
      cache_maximo: 500,
    });
    expect(result.success).toBe(true);
  });

  it('aceita campos opcionais como esta_publico e preco_ingresso_inteira', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      esta_publico: true,
      preco_ingresso_inteira: 50,
      preco_ingresso_meia: 25,
      capacidade_maxima: 200,
      classificacao_etaria: 18,
    });
    expect(result.success).toBe(true);
  });

  it('updateBookingSchema rejeita horario_fim igual a horario_inicio quando ambos fornecidos', () => {
    const result = updateBookingSchema.safeParse({
      horario_inicio: '20:00',
      horario_fim: '20:00',
    });
    expect(result.success).toBe(false);
  });

  it('updateBookingSchema aceita horario_inicio sem horario_fim (parcial)', () => {
    const result = updateBookingSchema.safeParse({ horario_inicio: '20:00' });
    expect(result.success).toBe(true);
  });

  it('updateBookingSchema rejeita quando cache_maximo < cache_minimo', () => {
    const result = updateBookingSchema.safeParse({
      cache_minimo: 1000,
      cache_maximo: 500,
    });
    expect(result.success).toBe(false);
  });
});

// ─── bandSchemas ──────────────────────────────────────────────────────────────

describe('createBandSchema', () => {
  const valid = { nome_banda: 'Os Testadores', perfil_artista_id: 1 };

  it('aceita banda válida', () => {
    expect(createBandSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita nome_banda ausente', () => {
    expect(createBandSchema.safeParse({ perfil_artista_id: 1 }).success).toBe(false);
  });

  it('rejeita perfil_artista_id não-numérico', () => {
    expect(createBandSchema.safeParse({ ...valid, perfil_artista_id: 'abc' }).success).toBe(false);
  });
});

describe('respondInvitationSchema', () => {
  it('aceita action accept', () => {
    expect(respondInvitationSchema.safeParse({ invitation_id: 1, action: 'accept' }).success).toBe(true);
  });

  it('aceita action reject', () => {
    expect(respondInvitationSchema.safeParse({ invitation_id: 1, action: 'reject' }).success).toBe(true);
  });

  it('rejeita action desconhecida', () => {
    expect(respondInvitationSchema.safeParse({ invitation_id: 1, action: 'maybe' }).success).toBe(false);
  });
});

// ─── bandApplicationSchemas ───────────────────────────────────────────────────

describe('applyBandSchema', () => {
  it('aceita aplicação válida com valor_proposto', () => {
    expect(applyBandSchema.safeParse({ banda_id: 1, evento_id: 2, valor_proposto: 500 }).success).toBe(true);
  });

  it('aceita aplicação com artista_id ao invés de banda_id', () => {
    expect(applyBandSchema.safeParse({ artista_id: 1, evento_id: 2, valor_proposto: 500 }).success).toBe(true);
  });

  it('rejeita quando evento_id está ausente', () => {
    expect(applyBandSchema.safeParse({ banda_id: 1, valor_proposto: 500 }).success).toBe(false);
  });

  it('rejeita quando valor_proposto está ausente', () => {
    expect(applyBandSchema.safeParse({ banda_id: 1, evento_id: 2 }).success).toBe(false);
  });

  it('rejeita ids negativos', () => {
    expect(applyBandSchema.safeParse({ banda_id: -1, evento_id: 2, valor_proposto: 500 }).success).toBe(false);
  });
});
