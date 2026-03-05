import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '../config/database';
import { ResponseAttributes } from '../types';

class Response extends Model<ResponseAttributes> implements ResponseAttributes {
  public id!: number;
  public surveyId!: string;
  public userId?: number;
  public deviceId?: string;
  public ipAddress?: string;
  public submittedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Response.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    surveyId: {
      type: DataTypes.STRING(12),
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'responses',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['survey_id', 'device_id'],
        name: 'survey_device_unique',
        where: {
          device_id: {
            [Op.ne]: null,
          },
        },
      },
    ],
  }
);

export default Response;
