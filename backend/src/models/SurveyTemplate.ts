import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface SurveyTemplateAttributes {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  questions: any;
  usageCount: number;
  isSystem: boolean;
  creatorId?: number;
  createdAt: Date;
  updatedAt: Date;
}

class SurveyTemplate extends Model<SurveyTemplateAttributes> implements SurveyTemplateAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public icon!: string;
  public questions!: any;
  public usageCount!: number;
  public isSystem!: boolean;
  public creatorId?: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SurveyTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'other',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Document',
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'survey_templates',
    timestamps: true,
  }
);

export default SurveyTemplate;
