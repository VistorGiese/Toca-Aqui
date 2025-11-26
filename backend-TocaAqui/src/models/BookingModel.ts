
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum BookingStatus {
  PENDENTE = 'pendente',
  ACEITO = 'aceito',
  REJEITADO = 'rejeitado',
  CANCELADO = 'cancelado',
  REALIZADO = 'realizado'
}

class BookingModel extends Model {
  id!: number;
  titulo_evento!: string;
  descricao_evento?: string;
  data_show!: Date;
  perfil_estabelecimento_id!: number; 
  horario_inicio!: string;
  horario_fim!: string;
  status!: BookingStatus;
}

BookingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    titulo_evento: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao_evento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_show: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    perfil_estabelecimento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perfis_estabelecimentos',
        key: 'id',
      },
    },
    horario_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horario_fim: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookingStatus)),
      allowNull: false,
      defaultValue: BookingStatus.PENDENTE,
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'agendamentos',
    timestamps: false,
  }
);


export default BookingModel;

