import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ArtistProfileAttributes {
  id?: number;
  usuario_id: number;
  nome_artistico: string;
  biografia?: string;
  instrumentos: string; 
  generos: string; 
  anos_experiencia?: number;
  url_portfolio?: string;
  foto_perfil?: string;
  esta_disponivel?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class ArtistProfileModel extends Model<ArtistProfileAttributes> implements ArtistProfileAttributes {
  public id!: number;
  public usuario_id!: number;
  public nome_artistico!: string;
  public biografia?: string;
  public instrumentos!: string;
  public generos!: string;
  public anos_experiencia?: number;
  public url_portfolio?: string;
  public foto_perfil?: string;
  public esta_disponivel!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ArtistProfileModel.init(
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
    nome_artistico: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instrumentos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    generos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    anos_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    url_portfolio: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    foto_perfil: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    esta_disponivel: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ArtistProfile',
    tableName: 'perfis_artistas',
    timestamps: true,
    underscored: true,
  }
);

export default ArtistProfileModel;