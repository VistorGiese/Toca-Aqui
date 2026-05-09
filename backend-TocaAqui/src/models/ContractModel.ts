import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum ContractStatus {
  RASCUNHO = 'rascunho',
  AGUARDANDO_ACEITE = 'aguardando_aceite',
  ACEITO = 'aceito',
  CANCELADO = 'cancelado',
  CONCLUIDO = 'concluido',
}

export enum StatusPagamento {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  FALHOU = 'falhou',
}

export enum PaymentMethod {
  PIX = 'pix',
  TRANSFERENCIA = 'transferencia',
  CARTAO = 'cartao',
  DINHEIRO = 'dinheiro',
  STRIPE = 'stripe',
}

export interface ContractAttributes {
  id?: number;
  aplicacao_id: number;
  evento_id: number;
  banda_id?: number;
  artista_id?: number;
  perfil_estabelecimento_id: number;
  status: ContractStatus;
  // Dados do contratante (snapshot)
  nome_contratante: string;
  documento_contratante?: string;
  endereco_contratante?: string;
  telefone_contratante: string;
  // Dados do contratado (snapshot)
  nome_contratado: string;
  documento_contratado?: string;
  telefone_contratado?: string;
  // Evento
  data_evento: Date;
  horario_inicio: string;
  horario_fim: string;
  duracao_minutos?: number;
  intervalos?: string;
  genero_musical?: string;
  local_evento?: string;
  // Cachê
  cache_total: number;
  metodo_pagamento: PaymentMethod;
  percentual_sinal: number;
  valor_sinal: number;
  data_pagamento_sinal?: Date;
  data_pagamento_restante?: Date;
  // Obrigações
  obrigacoes_contratante?: string;
  obrigacoes_contratado?: string;
  // Penalidades
  penalidade_cancelamento_72h: number;
  penalidade_cancelamento_24_72h: number;
  penalidade_cancelamento_24h: number;
  // Direitos e infraestrutura
  direitos_imagem: boolean;
  infraestrutura_som?: string;
  infraestrutura_backline?: string;
  observacoes?: string;
  // Aceite digital
  aceite_contratante: boolean;
  aceite_contratado: boolean;
  data_aceite_contratante?: Date;
  data_aceite_contratado?: Date;
  // Controle de edição
  ultima_edicao_por?: 'contratante' | 'contratado';
  versao: number;
  status_pagamento?: StatusPagamento;
  created_at?: Date;
  updated_at?: Date;
}

class ContractModel extends Model<ContractAttributes> implements ContractAttributes {
  public id!: number;
  public aplicacao_id!: number;
  public evento_id!: number;
  public banda_id?: number;
  public artista_id?: number;
  public perfil_estabelecimento_id!: number;
  public status!: ContractStatus;
  public nome_contratante!: string;
  public documento_contratante?: string;
  public endereco_contratante?: string;
  public telefone_contratante!: string;
  public nome_contratado!: string;
  public documento_contratado?: string;
  public telefone_contratado?: string;
  public data_evento!: Date;
  public horario_inicio!: string;
  public horario_fim!: string;
  public duracao_minutos?: number;
  public intervalos?: string;
  public genero_musical?: string;
  public local_evento?: string;
  public cache_total!: number;
  public metodo_pagamento!: PaymentMethod;
  public percentual_sinal!: number;
  public valor_sinal!: number;
  public data_pagamento_sinal?: Date;
  public data_pagamento_restante?: Date;
  public obrigacoes_contratante?: string;
  public obrigacoes_contratado?: string;
  public penalidade_cancelamento_72h!: number;
  public penalidade_cancelamento_24_72h!: number;
  public penalidade_cancelamento_24h!: number;
  public direitos_imagem!: boolean;
  public infraestrutura_som?: string;
  public infraestrutura_backline?: string;
  public observacoes?: string;
  public aceite_contratante!: boolean;
  public aceite_contratado!: boolean;
  public data_aceite_contratante?: Date;
  public data_aceite_contratado?: Date;
  public ultima_edicao_por?: 'contratante' | 'contratado';
  public versao!: number;
  public status_pagamento!: StatusPagamento;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ContractModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aplicacao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'aplicacoes_banda_evento', key: 'id' },
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'agendamentos', key: 'id' },
    },
    banda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'bandas', key: 'id' },
    },
    artista_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'perfis_artistas', key: 'id' },
    },
    perfil_estabelecimento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'perfis_estabelecimentos', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ContractStatus)),
      allowNull: false,
      defaultValue: ContractStatus.RASCUNHO,
    },
    // Snapshot contratante
    nome_contratante: { type: DataTypes.STRING(255), allowNull: false },
    documento_contratante: { type: DataTypes.STRING(20), allowNull: true },
    endereco_contratante: { type: DataTypes.TEXT, allowNull: true },
    telefone_contratante: { type: DataTypes.STRING(20), allowNull: false },
    // Snapshot contratado
    nome_contratado: { type: DataTypes.STRING(255), allowNull: false },
    documento_contratado: { type: DataTypes.STRING(20), allowNull: true },
    telefone_contratado: { type: DataTypes.STRING(20), allowNull: true },
    // Evento
    data_evento: { type: DataTypes.DATEONLY, allowNull: false },
    horario_inicio: { type: DataTypes.TIME, allowNull: false },
    horario_fim: { type: DataTypes.TIME, allowNull: false },
    duracao_minutos: { type: DataTypes.INTEGER, allowNull: true },
    intervalos: { type: DataTypes.TEXT, allowNull: true },
    genero_musical: { type: DataTypes.STRING(255), allowNull: true },
    local_evento: { type: DataTypes.TEXT, allowNull: true },
    // Cachê
    cache_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metodo_pagamento: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
      defaultValue: PaymentMethod.STRIPE,
    },
    percentual_sinal: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 50.00 },
    valor_sinal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    data_pagamento_sinal: { type: DataTypes.DATEONLY, allowNull: true },
    data_pagamento_restante: { type: DataTypes.DATEONLY, allowNull: true },
    // Obrigações
    obrigacoes_contratante: { type: DataTypes.TEXT, allowNull: true },
    obrigacoes_contratado: { type: DataTypes.TEXT, allowNull: true },
    // Penalidades de cancelamento
    penalidade_cancelamento_72h: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00 },
    penalidade_cancelamento_24_72h: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 50.00 },
    penalidade_cancelamento_24h: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100.00 },
    // Direitos e infraestrutura
    direitos_imagem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    infraestrutura_som: { type: DataTypes.TEXT, allowNull: true },
    infraestrutura_backline: { type: DataTypes.TEXT, allowNull: true },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    // Aceite digital
    aceite_contratante: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    aceite_contratado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    data_aceite_contratante: { type: DataTypes.DATE, allowNull: true },
    data_aceite_contratado: { type: DataTypes.DATE, allowNull: true },
    // Controle de edição
    ultima_edicao_por: {
      type: DataTypes.ENUM('contratante', 'contratado'),
      allowNull: true,
    },
    versao: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    status_pagamento: {
      type: DataTypes.ENUM(...Object.values(StatusPagamento)),
      allowNull: false,
      defaultValue: StatusPagamento.PENDENTE,
    },
  },
  {
    sequelize,
    modelName: 'Contract',
    tableName: 'contratos',
    timestamps: true,
    underscored: true,
  }
);

export default ContractModel;
