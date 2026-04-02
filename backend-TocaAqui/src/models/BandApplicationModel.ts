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
  banda_id?: number;
  artista_id?: number;
  mensagem?: string;
  evento_id!: number;
  status!: ApplicationStatus;
  data_aplicacao!: Date;
  valor_proposto?: number;
}

BandApplicationModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  banda_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bandas',
      key: 'id',
    },
  },
  artista_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'perfis_artistas',
      key: 'id',
    },
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  valor_proposto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'BandApplication',
  tableName: 'aplicacoes_banda_evento',
  timestamps: false,
});

export default BandApplicationModel;
