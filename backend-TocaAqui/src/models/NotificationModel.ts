import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum NotificationType {
  APLICACAO_RECEBIDA   = 'aplicacao_recebida',
  APLICACAO_ACEITA     = 'aplicacao_aceita',
  APLICACAO_REJEITADA  = 'aplicacao_rejeitada',
  CONVITE_BANDA        = 'convite_banda',
  SISTEMA              = 'sistema',
  CONTRATO_GERADO      = 'contrato_gerado',
  CONTRATO_ATUALIZADO  = 'contrato_atualizado',
  CONTRATO_ACEITO      = 'contrato_aceito',
  CONTRATO_CANCELADO   = 'contrato_cancelado',
  PAGAMENTO_PENDENTE   = 'pagamento_pendente',
  PAGAMENTO_RECEBIDO   = 'pagamento_recebido',
  PAGAMENTO_FALHOU     = 'pagamento_falhou',
}

export interface NotificationAttributes {
  id?: number;
  usuario_id: number;
  tipo: NotificationType;
  mensagem: string;
  lida?: boolean;
  referencia_tipo?: string;
  referencia_id?: number;
  created_at?: Date;
}

class NotificationModel extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number;
  public usuario_id!: number;
  public tipo!: NotificationType;
  public mensagem!: string;
  public lida!: boolean;
  public referencia_tipo?: string;
  public referencia_id?: number;
  public readonly created_at!: Date;
}

NotificationModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.ENUM(...Object.values(NotificationType)), allowNull: false },
    mensagem: { type: DataTypes.TEXT, allowNull: false },
    lida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    referencia_tipo: { type: DataTypes.STRING(50), allowNull: true },
    referencia_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notificacoes',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default NotificationModel;
