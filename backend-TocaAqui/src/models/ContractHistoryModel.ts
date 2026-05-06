import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ContractHistoryAttributes {
  id?: number;
  contrato_id: number;
  campo_alterado: string;
  valor_anterior?: string;
  valor_novo?: string;
  alterado_por: 'contratante' | 'contratado';
  usuario_id: number;
  created_at?: Date;
}

class ContractHistoryModel extends Model<ContractHistoryAttributes> implements ContractHistoryAttributes {
  public id!: number;
  public contrato_id!: number;
  public campo_alterado!: string;
  public valor_anterior?: string;
  public valor_novo?: string;
  public alterado_por!: 'contratante' | 'contratado';
  public usuario_id!: number;
  public readonly created_at!: Date;
}

ContractHistoryModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    contrato_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'contratos', key: 'id' },
    },
    campo_alterado: { type: DataTypes.STRING(100), allowNull: false },
    valor_anterior: { type: DataTypes.TEXT, allowNull: true },
    valor_novo: { type: DataTypes.TEXT, allowNull: true },
    alterado_por: {
      type: DataTypes.ENUM('contratante', 'contratado'),
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'ContractHistory',
    tableName: 'historico_contratos',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default ContractHistoryModel;
