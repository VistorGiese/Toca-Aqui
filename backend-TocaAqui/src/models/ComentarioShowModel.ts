import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ComentarioShowModel extends Model {
  id!: number;
  usuario_id!: number;
  agendamento_id!: number;
  texto!: string;
  curtidas_count!: number;
  parent_id?: number;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

ComentarioShowModel.init(
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
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    curtidas_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comentarios_shows',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'ComentarioShow',
    tableName: 'comentarios_shows',
    timestamps: true,
    underscored: true,
  }
);

export default ComentarioShowModel;
