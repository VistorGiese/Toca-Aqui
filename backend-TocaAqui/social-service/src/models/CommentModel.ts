import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CommentAttributes {
  id?: number;
  usuario_id: number;
  comentavel_tipo: 'perfil_estabelecimento' | 'perfil_artista' | 'banda' | 'agendamento';
  comentavel_id: number;
  texto: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

class CommentModel extends Model<CommentAttributes> implements CommentAttributes {
  public id!: number;
  public usuario_id!: number;
  public comentavel_tipo!: 'perfil_estabelecimento' | 'perfil_artista' | 'banda' | 'agendamento';
  public comentavel_id!: number;
  public texto!: string;
  public readonly data_criacao!: Date;
  public readonly data_atualizacao!: Date;
}

CommentModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comentavel_tipo: {
    type: DataTypes.ENUM('perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'),
    allowNull: false,
  },
  comentavel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comentarios',
  timestamps: true,
  underscored: true,
});

export default CommentModel;
