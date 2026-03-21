import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { TemplateAttributes } from '../types';

class SurveyTemplate extends Model<TemplateAttributes> implements TemplateAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public category!: 'satisfaction' | 'event' | 'feedback' | 'research' | 'other';
  public questions!: string; // JSON string storing questions data
  public isSystem!: boolean;
  public creatorId!: number;
  public usageCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SurveyTemplate.init(
  {
    id: {
      type: DataTypes.STRING(12),
      primaryKey: true,
      defaultValue: 'temp-' + Date.now().toString(36),
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        'satisfaction',
        'event',
        'feedback',
        'research',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other',
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'survey_templates',
    timestamps: true,
  }
);

export default SurveyTemplate;
