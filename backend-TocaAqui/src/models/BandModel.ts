
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface BandAttributes {
  id?: number;
  nome_banda?: string;
  descricao?: string;
  imagem?: string;
  generos_musicais?: string[];
  data_criacao?: Date;
  esta_ativo?: boolean;
  // Campos para candidatura a eventos e geração de contratos
  cache_minimo?: number;
  cache_maximo?: number;
  cidade?: string;
  estado?: string;
  telefone_contato?: string;
  links_sociais?: any;
  press_kit?: any;
  tem_estrutura_som?: boolean;
  estrutura_som?: any;
  nota_media?: number;
  shows_realizados?: number;
  esta_disponivel?: boolean;
  datas_indisponiveis?: any;
  created_at?: Date;
  updated_at?: Date;
}

class BandModel extends Model<BandAttributes> implements BandAttributes {
  public id!: number;
  public nome_banda?: string;
  public descricao?: string;
  public imagem?: string;
  public generos_musicais?: string[];
  public data_criacao?: Date;
  public esta_ativo!: boolean;
  public cache_minimo?: number;
  public cache_maximo?: number;
  public cidade?: string;
  public estado?: string;
  public telefone_contato?: string;
  public links_sociais?: any;
  public press_kit?: any;
  public tem_estrutura_som!: boolean;
  public estrutura_som?: any;
  public nota_media?: number;
  public shows_realizados!: number;
  public esta_disponivel!: boolean;
  public datas_indisponiveis?: any;
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
    cache_minimo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cache_maximo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    telefone_contato: {
      type: DataTypes.STRING(20),
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
    nota_media: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    shows_realizados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    esta_disponivel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    datas_indisponiveis: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
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