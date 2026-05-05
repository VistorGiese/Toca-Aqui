import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export type EstablishmentMemberRole = 'admin';

export interface EstablishmentMemberAttributes {
  id?: number;
  estabelecimento_id: number;
  usuario_id: number;
  role: EstablishmentMemberRole;
  created_at?: Date;
  updated_at?: Date;
}

class EstablishmentMemberModel
  extends Model<EstablishmentMemberAttributes>
  implements EstablishmentMemberAttributes
{
  public id!: number;
  public estabelecimento_id!: number;
  public usuario_id!: number;
  public role!: EstablishmentMemberRole;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EstablishmentMemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estabelecimento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'perfis_estabelecimentos', key: 'id' },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    role: {
      type: DataTypes.ENUM('admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
  },
  {
    sequelize,
    modelName: 'EstablishmentMember',
    tableName: 'estabelecimento_membros',
    timestamps: true,
    underscored: true,
  }
);

export default EstablishmentMemberModel;
