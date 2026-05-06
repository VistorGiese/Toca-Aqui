import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface EstablishmentProfileAttributes {
  id?: number;
  usuario_id: number;
  nome_estabelecimento: string;
  tipo_estabelecimento: 'bar' | 'casa_show' | 'restaurante' | 'club' | 'outro';
  descricao?: string;
  generos_musicais: string;
  horario_abertura: string;
  horario_fechamento: string;
  endereco_id?: number;
  telefone_contato: string;
  fotos?: string;
  esta_ativo?: boolean;
  shows_realizados?: number;
  nota_media?: number;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
  updated_at?: Date;
}

class EstablishmentProfileModel extends Model<EstablishmentProfileAttributes> implements EstablishmentProfileAttributes {
  public id!: number;
  public usuario_id!: number;
  public nome_estabelecimento!: string;
  public tipo_estabelecimento!: 'bar' | 'casa_show' | 'restaurante' | 'club' | 'outro';
  public descricao?: string;
  public generos_musicais!: string;
  public horario_abertura!: string;
  public horario_fechamento!: string;
  public endereco_id?: number;
  public telefone_contato!: string;
  public fotos?: string;
  public esta_ativo!: boolean;
  public shows_realizados!: number;
  public nota_media?: number;
  public latitude?: number;
  public longitude?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EstablishmentProfileModel.init(
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
    nome_estabelecimento: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_estabelecimento: {
      type: DataTypes.ENUM('bar', 'casa_show', 'restaurante', 'club', 'outro'),
      allowNull: false,
      defaultValue: 'bar',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    generos_musicais: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    horario_abertura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horario_fechamento: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endereco_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'enderecos',
        key: 'id',
      },
    },
    telefone_contato: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fotos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    esta_ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'EstablishmentProfile',
    tableName: 'perfis_estabelecimentos',
    timestamps: true,
    underscored: true,
  }
);

export default EstablishmentProfileModel;