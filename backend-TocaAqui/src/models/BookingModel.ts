
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
  preco_ingresso_inteira?: number;
  preco_ingresso_meia?: number;
  capacidade_maxima?: number;
  ingressos_vendidos!: number;
  classificacao_etaria?: string;
  imagem_capa?: string;
  esta_publico!: boolean;
  genero_musical?: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
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
    preco_ingresso_inteira: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    preco_ingresso_meia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    capacidade_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ingressos_vendidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    classificacao_etaria: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    imagem_capa: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    esta_publico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    genero_musical: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'agendamentos',
    timestamps: true,
    underscored: true,
  }
);


export default BookingModel;

