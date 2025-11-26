import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface BandMemberAttributes {
  id?: number;
  banda_id: number;
  perfil_artista_id: number;
  funcao?: string;
  e_lider?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  data_entrada?: Date;
  created_at?: Date;
  updated_at?: Date;
}

class BandMemberModel extends Model<BandMemberAttributes> implements BandMemberAttributes {
  public id!: number;
  public banda_id!: number;
  public perfil_artista_id!: number;
  public funcao?: string;
  public e_lider!: boolean;
  public status!: 'pending' | 'approved' | 'rejected';
  public data_entrada?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BandMemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    banda_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bandas',
        key: 'id',
      },
    },
    perfil_artista_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perfis_artistas',
        key: 'id',
      },
    },
    funcao: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Função na banda (ex: guitarrista, vocalista, baterista)',
    },
    e_lider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    data_entrada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BandMember',
    tableName: 'membros_banda',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['banda_id', 'perfil_artista_id'],
        name: 'unique_band_artist_membership',
      },
    ],
  }
);

export default BandMemberModel;