import sequelize from '../config/database';
import User from './User';
import Survey from './Survey';
import Question from './Question';
import QuestionOption from './QuestionOption';
import Response from './Response';
import Answer from './Answer';

// Define associations
User.hasMany(Survey, { foreignKey: 'creatorId', as: 'surveys' });
Survey.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Survey.hasMany(Question, { foreignKey: 'surveyId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

Question.hasMany(QuestionOption, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
QuestionOption.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Survey.hasMany(Response, { foreignKey: 'surveyId', as: 'responses' });
Response.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

User.hasMany(Response, { foreignKey: 'userId', as: 'responses' });
Response.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Response.hasMany(Answer, { foreignKey: 'responseId', as: 'answers', onDelete: 'CASCADE' });
Answer.belongsTo(Response, { foreignKey: 'responseId', as: 'response' });

Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

export {
  sequelize,
  User,
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer,
};
