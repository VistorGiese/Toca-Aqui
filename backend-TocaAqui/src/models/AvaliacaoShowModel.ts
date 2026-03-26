import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AvaliacaoShowModel extends Model {
  id!: number;
  usuario_id!: number;
  agendamento_id!: number;
  nota_artista!: number;
  nota_local!: number;
  comentario?: string;
  tags_artista?: string[];
  tags_local?: string[];
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

AvaliacaoShowModel.init(
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
    agendamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'agendamentos',
        key: 'id',
      },
    },
    nota_artista: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nota_local: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags_artista: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags_local: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AvaliacaoShow',
    tableName: 'avaliacoes_shows',
    timestamps: true,
    underscored: true,
  }
);

export default AvaliacaoShowModel;
