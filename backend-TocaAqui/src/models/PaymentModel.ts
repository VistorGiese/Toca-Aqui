import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum PaymentStatus {
  PENDENTE = 'pendente',
  PROCESSANDO = 'processando',
  PAGO = 'pago',
  FALHOU = 'falhou',
  REEMBOLSADO = 'reembolsado',
  CANCELADO = 'cancelado',
}

export enum PaymentType {
  SINAL = 'sinal',
  RESTANTE = 'restante',
  TOTAL = 'total',
}

export interface PaymentAttributes {
  id?: number;
  contrato_id: number;
  tipo: PaymentType;
  valor: number;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  metodo_pagamento?: string;
  data_pagamento?: Date;
  data_vencimento?: Date;
  tentativas: number;
  erro_mensagem?: string;
  metadata?: object;
  created_at?: Date;
  updated_at?: Date;
}

class PaymentModel extends Model<PaymentAttributes> implements PaymentAttributes {
  public id!: number;
  public contrato_id!: number;
  public tipo!: PaymentType;
  public valor!: number;
  public status!: PaymentStatus;
  public stripe_payment_intent_id?: string;
  public stripe_charge_id?: string;
  public metodo_pagamento?: string;
  public data_pagamento?: Date;
  public data_vencimento?: Date;
  public tentativas!: number;
  public erro_mensagem?: string;
  public metadata?: object;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PaymentModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    contrato_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'contratos', key: 'id' },
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(PaymentType)),
      allowNull: false,
    },
    valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDENTE,
    },
    stripe_payment_intent_id: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    stripe_charge_id: { type: DataTypes.STRING(255), allowNull: true },
    metodo_pagamento: { type: DataTypes.STRING(50), allowNull: true },
    data_pagamento: { type: DataTypes.DATE, allowNull: true },
    data_vencimento: { type: DataTypes.DATEONLY, allowNull: true },
    tentativas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    erro_mensagem: { type: DataTypes.TEXT, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'pagamentos',
    timestamps: true,
    underscored: true,
  }
);

export default PaymentModel;
