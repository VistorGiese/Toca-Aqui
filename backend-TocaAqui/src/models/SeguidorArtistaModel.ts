import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SeguidorArtistaModel extends Model {
  id!: number;
  usuario_id!: number;
  perfil_artista_id!: number;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

SeguidorArtistaModel.init(
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
    perfil_artista_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perfis_artistas',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'SeguidorArtista',
    tableName: 'seguidores_artistas',
    timestamps: true,
    underscored: true,
  }
);

export default SeguidorArtistaModel;
