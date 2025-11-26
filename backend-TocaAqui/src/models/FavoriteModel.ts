import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface FavoriteAttributes {
  id?: number;
  usuario_id: number;
  favoritavel_tipo: 'perfil_estabelecimento' | 'perfil_artista' | 'banda';
  favoritavel_id: number;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

class FavoriteModel extends Model<FavoriteAttributes> implements FavoriteAttributes {
  public id!: number;
  public usuario_id!: number;
  public favoritavel_tipo!: 'perfil_estabelecimento' | 'perfil_artista' | 'banda';
  public favoritavel_id!: number;
  public readonly data_criacao!: Date;
  public readonly data_atualizacao!: Date;
}

FavoriteModel.init({
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
  favoritavel_tipo: {
    type: DataTypes.ENUM('perfil_estabelecimento', 'perfil_artista', 'banda'),
    allowNull: false,
  },
  favoritavel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favoritos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'favoritavel_tipo', 'favoritavel_id'],
      name: 'favorito_unico_usuario',
    },
  ],
});

export default FavoriteModel;