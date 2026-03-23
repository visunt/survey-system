import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { SurveyAttributes } from '../types';
import { generateId } from '../utils/generateId';

class Survey extends Model<SurveyAttributes> implements SurveyAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public status!: 'draft' | 'published' | 'closed';
  public creatorId!: number;
  public startDate?: Date;
  public endDate?: Date;
  public deadline?: Date;
  public responseLimit?: number;
  public maxResponsesPerUser!: number;
  public allowAnonymous!: boolean;
  public requireLogin!: boolean;
  public limitByDevice!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Survey.init(
  {
    id: {
      type: DataTypes.STRING(12),
      primaryKey: true,
      defaultValue: () => generateId(12),
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'closed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    responseLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '回收数量上限，NULL表示无限制',
    },
    maxResponsesPerUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '每人限填次数，0表示不限制',
    },
    allowAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    requireLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    limitByDevice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'surveys',
    timestamps: true,
  }
);

export default Survey;
