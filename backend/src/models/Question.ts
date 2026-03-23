import { DataTypes, Model, Association } from 'sequelize';
import sequelize from '../config/database';
import { QuestionAttributes, QuestionOptionAttributes, SkipLogic, ValidationRule, DisplayLogic } from '../types';
import Survey from './Survey';
import QuestionOption from './QuestionOption';
import Answer from './Answer';

class Question extends Model<QuestionAttributes> implements QuestionAttributes {
  public id!: number;
  public surveyId!: string;
  public title!: string;
  public type!: 'single_choice' | 'multiple_choice' | 'text' | 'textarea' | 'rating' | 'date' | 'dropdown_single' | 'dropdown_multiple' | 'switch';
  public isRequired!: boolean;
  public orderIndex!: number;
  public skipLogic?: SkipLogic;
  public displayLogic?: DisplayLogic;
  public validationRules?: ValidationRule[];
  public options?: QuestionOptionAttributes[];
  public answers?: Answer[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    survey: Association<Question, Survey>;
    options: Association<Question, QuestionOption>;
    answers: Association<Question, Answer>;
  };
}

Question.init(
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('single_choice', 'multiple_choice', 'text', 'textarea', 'rating', 'date', 'dropdown_single', 'dropdown_multiple', 'switch'),
      allowNull: false,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    skipLogic: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue('skipLogic');
        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
      },
      set(value: SkipLogic | null | undefined) {
        this.setDataValue('skipLogic', value ? JSON.stringify(value) as any : undefined);
      },
    },
    displayLogic: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue('displayLogic');
        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
      },
      set(value: DisplayLogic | null | undefined) {
        this.setDataValue('displayLogic', value ? JSON.stringify(value) as any : undefined);
      },
    },
    validationRules: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue('validationRules');
        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
      },
      set(value: ValidationRule[] | null | undefined) {
        this.setDataValue('validationRules', value ? JSON.stringify(value) as any : undefined);
      },
    },
  },
  {
    sequelize,
    tableName: 'questions',
    timestamps: true,
  }
);

export default Question;
