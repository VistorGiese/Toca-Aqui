
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AddressModel extends Model {
  id!: number;
  rua!: string;
  numero!: string;
  bairro!: string;
  cidade!: string;
  estado!: string;
  cep!: string;
}

AddressModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rua: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    bairro: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cidade: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    cep: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'enderecos',
    timestamps: false,
  }
);

export default AddressModel;