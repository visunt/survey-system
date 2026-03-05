import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface PasswordResetAttributes {
  id?: number;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class PasswordReset extends Model<PasswordResetAttributes> implements PasswordResetAttributes {
  public id!: number;
  public email!: string;
  public token!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
  }
);

export default PasswordReset;
