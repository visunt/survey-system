import { DataTypes, Model, Association } from 'sequelize';
import sequelize from '../config/database';
import { QuestionOptionAttributes } from '../types';
import Question from './Question';

class QuestionOption extends Model<QuestionOptionAttributes> implements QuestionOptionAttributes {
  public id!: number;
  public questionId!: number;
  public text!: string;
  public orderIndex!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    question: Association<QuestionOption, Question>;
  };
}

QuestionOption.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    text: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'question_options',
    timestamps: true,
  }
);

export default QuestionOption;
