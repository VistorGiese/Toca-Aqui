import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CurtidaComentarioModel extends Model {
  id!: number;
  usuario_id!: number;
  comentario_id!: number;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

CurtidaComentarioModel.init(
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
    comentario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'comentarios_shows',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'CurtidaComentario',
    tableName: 'curtidas_comentarios',
    timestamps: true,
    underscored: true,
  }
);

export default CurtidaComentarioModel;
