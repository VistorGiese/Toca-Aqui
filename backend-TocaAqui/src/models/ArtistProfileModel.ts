import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ArtistProfileAttributes {
  id?: number;
  usuario_id: number;
  nome_artistico: string;
  biografia?: string;
  instrumentos: any;
  generos: any;
  anos_experiencia?: number;
  url_portfolio?: string;
  foto_perfil?: string;
  esta_disponivel?: boolean;
  tipo_atuacao?: string;
  cache_minimo?: number;
  cache_maximo?: number;
  tem_estrutura_som?: boolean;
  estrutura_som?: any;
  cidade?: string;
  estado?: string;
  links_sociais?: any;
  press_kit?: any;
  datas_indisponiveis?: any;
  shows_realizados?: number;
  nota_media?: number;
  created_at?: Date;
  updated_at?: Date;
}

class ArtistProfileModel extends Model<ArtistProfileAttributes> implements ArtistProfileAttributes {
  public id!: number;
  public usuario_id!: number;
  public nome_artistico!: string;
  public biografia?: string;
  public instrumentos!: any;
  public generos!: any;
  public anos_experiencia?: number;
  public url_portfolio?: string;
  public foto_perfil?: string;
  public esta_disponivel!: boolean;
  public tipo_atuacao?: string;
  public cache_minimo?: number;
  public cache_maximo?: number;
  public tem_estrutura_som!: boolean;
  public estrutura_som?: any;
  public cidade?: string;
  public estado?: string;
  public links_sociais?: any;
  public press_kit?: any;
  public datas_indisponiveis?: any;
  public shows_realizados!: number;
  public nota_media?: number;
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
      references: { model: 'usuarios', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    tipo_atuacao: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'solo',
    },
    cache_minimo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cache_maximo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tem_estrutura_som: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    estrutura_som: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    links_sociais: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    press_kit: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    datas_indisponiveis: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    shows_realizados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nota_media: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
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