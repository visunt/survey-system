import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { SurveyAttributes } from '../types';

class Survey extends Model<SurveyAttributes> implements SurveyAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: 'draft' | 'published' | 'closed';
  public creatorId!: number;
  public startDate?: Date;
  public endDate?: Date;
  public allowAnonymous!: boolean;
  public requireLogin!: boolean;
  public limitByDevice!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Survey.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
