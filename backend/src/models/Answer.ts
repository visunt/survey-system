import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { AnswerAttributes } from '../types';

class Answer extends Model<AnswerAttributes> implements AnswerAttributes {
  public id!: number;
  public responseId!: number;
  public questionId!: number;
  public answer!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Answer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    responseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'responses',
        key: 'id',
      },
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'answers',
    timestamps: true,
  }
);

export default Answer;
