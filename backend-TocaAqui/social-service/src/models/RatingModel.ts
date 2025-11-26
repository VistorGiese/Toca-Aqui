import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface RatingAttributes {
  id?: number;
  usuario_id: number;
  avaliavel_tipo: 'perfil_estabelecimento' | 'perfil_artista' | 'banda';
  avaliavel_id: number;
  nota: number; 
  comentario?: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

class RatingModel extends Model<RatingAttributes> implements RatingAttributes {
  public id!: number;
  public usuario_id!: number;
  public avaliavel_tipo!: 'perfil_estabelecimento' | 'perfil_artista' | 'banda';
  public avaliavel_id!: number;
  public nota!: number;
  public comentario?: string;
  public readonly data_criacao!: Date;
  public readonly data_atualizacao!: Date;
}

RatingModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  avaliavel_tipo: {
    type: DataTypes.ENUM('perfil_estabelecimento', 'perfil_artista', 'banda'),
    allowNull: false,
  },
  avaliavel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Rating',
  tableName: 'avaliacoes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'avaliavel_tipo', 'avaliavel_id'],
      name: 'avaliacao_unica_usuario',
    },
  ],
});

export default RatingModel;
