/**
 * Factories para testes — retornam objetos com valores padrão válidos.
 * Use spread para sobrescrever campos específicos em cada teste.
 */

export function makeUserData(overrides: Record<string, unknown> = {}) {
  return {
    nome_completo: 'Usuário Teste',
    email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
    senha: 'senha_hash_segura',
    roles: ['common_user'],
    role: 'common_user',
    email_verificado: true,
    ...overrides,
  };
}

export function makeArtistProfileData(usuario_id: number, overrides: Record<string, unknown> = {}) {
  return {
    usuario_id,
    nome_artistico: 'Artista Teste',
    bio: 'Bio do artista de teste',
    generos: ['Rock', 'Blues'],
    cache_minimo: 500,
    cache_maximo: 2000,
    shows_realizados: 0,
    nota_media: 0,
    cidade: 'São Paulo',
    estado: 'SP',
    ...overrides,
  };
}

export function makeEstablishmentData(usuario_id: number, overrides: Record<string, unknown> = {}) {
  return {
    usuario_id,
    nome_estabelecimento: 'Bar Teste',
    tipo_estabelecimento: 'bar',
    generos_musicais: 'Rock, Blues',
    horario_abertura: '18:00:00',
    horario_fechamento: '02:00:00',
    telefone_contato: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    capacidade: 200,
    ...overrides,
  };
}

export function makeContractData(
  evento_id: number,
  perfil_estabelecimento_id: number,
  overrides: Record<string, unknown> = {}
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  return {
    aplicacao_id: 1,
    evento_id,
    perfil_estabelecimento_id,
    status: 'aguardando_aceite',
    nome_contratante: 'Bar Teste',
    telefone_contratante: '11999999999',
    nome_contratado: 'Artista Teste',
    data_evento: futureDate,
    horario_inicio: '20:00:00',
    horario_fim: '23:00:00',
    duracao_minutos: 180,
    cache_total: 1500,
    metodo_pagamento: 'stripe',
    percentual_sinal: 50,
    valor_sinal: 750,
    penalidade_cancelamento_72h: 0,
    penalidade_cancelamento_24_72h: 50,
    penalidade_cancelamento_24h: 100,
    direitos_imagem: true,
    aceite_contratante: false,
    aceite_contratado: false,
    versao: 1,
    status_pagamento: 'pendente',
    ...overrides,
  };
}

export function makeBandApplicationData(
  evento_id: number,
  overrides: Record<string, unknown> = {}
) {
  return {
    evento_id,
    mensagem: 'Proposta de aplicação',
    valor_proposto: 1500,
    status: 'pendente',
    ...overrides, // usar para setar artista_id e/ou banda_id
  };
}

export function makeBookingData(
  perfil_estabelecimento_id: number,
  overrides: Record<string, unknown> = {}
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  return {
    titulo_evento: 'Show de Teste',
    descricao_evento: 'Descrição do show de teste',
    data_show: futureDate,
    perfil_estabelecimento_id,
    horario_inicio: '20:00:00',
    horario_fim: '23:00:00',
    status: 'pendente',
    ingressos_vendidos: 0,
    esta_publico: true,
    ...overrides,
  };
}
