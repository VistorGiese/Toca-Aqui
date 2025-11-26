import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum ApplicationStatus {
  PENDENTE = 'pendente',
  ACEITO = 'aceito',
  REJEITADO = 'rejeitado',
  CANCELADO = 'cancelado'
}

class BandApplicationModel extends Model {
  id!: number;
  banda_id!: number;
  evento_id!: number;
  status!: ApplicationStatus; 
  data_aplicacao!: Date;
}

BandApplicationModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  banda_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bandas',
      key: 'id',
    },
  },
  evento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agendamentos',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
    allowNull: false,
    defaultValue: ApplicationStatus.PENDENTE,
  },
  data_aplicacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'BandApplication',
  tableName: 'aplicacoes_banda_evento',
  timestamps: false,
});

export default BandApplicationModel;
