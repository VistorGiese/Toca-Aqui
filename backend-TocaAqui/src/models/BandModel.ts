
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface BandAttributes {
  id?: number;
  nome_banda?: string;
  descricao?: string;
  imagem?: string;
  generos_musicais?: string; 
  data_criacao?: Date;
  esta_ativo?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class BandModel extends Model<BandAttributes> implements BandAttributes {
  public id!: number;
  public nome_banda?: string;
  public descricao?: string;
  public imagem?: string;
  public generos_musicais?: string;
  public data_criacao?: Date;
  public esta_ativo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BandModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome_banda: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imagem: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    generos_musicais: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    esta_ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Band',
    tableName: 'bandas',
    timestamps: true,
    underscored: true,
  }
);

export default BandModel;