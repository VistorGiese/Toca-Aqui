import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum IngressoTipo {
  INTEIRA = 'inteira',
  MEIA_ENTRADA = 'meia_entrada',
  VIP = 'vip',
}

export enum IngressoStatus {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  UTILIZADO = 'utilizado',
}

class IngressoModel extends Model {
  id!: number;
  usuario_id!: number;
  agendamento_id!: number;
  tipo!: IngressoTipo;
  preco!: number;
  status!: IngressoStatus;
  codigo_qr!: string;
  stripe_payment_intent_id?: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

IngressoModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'agendamentos',
        key: 'id',
      },
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(IngressoTipo)),
      allowNull: false,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(IngressoStatus)),
      allowNull: false,
      defaultValue: IngressoStatus.PENDENTE,
    },
    codigo_qr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Ingresso',
    tableName: 'ingressos',
    timestamps: true,
    underscored: true,
  }
);

export default IngressoModel;
