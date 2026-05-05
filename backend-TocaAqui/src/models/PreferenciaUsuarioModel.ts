import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PreferenciaUsuarioModel extends Model {
  id!: number;
  usuario_id!: number;
  generos_favoritos?: string[];
  cidade?: string;
  raio_busca_km!: number;
  tipos_local?: string[];
  notif_novos_shows!: boolean;
  notif_lembretes!: boolean;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

PreferenciaUsuarioModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    generos_favoritos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    raio_busca_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    tipos_local: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    notif_novos_shows: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notif_lembretes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'PreferenciaUsuario',
    tableName: 'preferencias_usuario',
    timestamps: true,
    underscored: true,
  }
);

export default PreferenciaUsuarioModel;
