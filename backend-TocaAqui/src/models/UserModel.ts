import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
export { UserRole } from '../types/roles';
import { UserRole } from '../types/roles';

export interface UserAttributes {
  id?: number;
  email: string;
  senha: string;
  nome_completo: string;
  role?: UserRole;
  roles?: string[];
  email_verificado?: boolean;
  foto_perfil?: string;
  created_at?: Date;
  updated_at?: Date;
}

class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public senha!: string;
  public nome_completo!: string;
  public role!: UserRole;
  public roles!: string[];
  public email_verificado!: boolean;
  public foto_perfil?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nome_completo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.COMMON_USER,
      comment: 'Role do usuário para RBAC (admin, establishment_owner, artist, common_user)'
    },
    roles: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '["common_user"]',
      get() {
        const raw = (this as any).getDataValue('roles');
        if (!raw) return ['common_user'];
        try { return JSON.parse(raw); } catch { return ['common_user']; }
      },
      set(value: string[]) {
        (this as any).setDataValue('roles', JSON.stringify(value));
      },
    },
    email_verificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    foto_perfil: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
  }
);

export default UserModel;