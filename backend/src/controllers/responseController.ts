import { Response, Request } from 'express';
import { Response as SurveyResponse, Answer, Question, Survey, QuestionOption } from '../models';
import { AuthRequest } from '../types';

export const submitResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const { answers, deviceId } = req.body;
    const userId = req.user?.id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status !== 'published') {
      return res.status(400).json({ error: 'Survey is not available' });
    }

    if (survey.requireLogin && !userId) {
      return res.status(401).json({ error: 'Login required' });
    }

    if (!survey.allowAnonymous && !userId) {
      return res.status(401).json({ error: 'Anonymous responses not allowed' });
    }

    if (survey.limitByDevice && deviceId) {
      const existingResponse = await SurveyResponse.findOne({
        where: { surveyId, deviceId },
      });
      if (existingResponse) {
        return res.status(400).json({ error: 'This device has already submitted a response' });
      }
    }

    const questions = await Question.findAll({
      where: { surveyId },
      include: [{ model: QuestionOption, as: 'options' }],
    });

    for (const question of questions) {
      const answer = answers.find((a: any) => a.questionId === question.id);

      if (question.isRequired && (!answer || !answer.answer)) {
        return res.status(400).json({ error: `Question "${question.title}" is required` });
      }
    }

    const response = await SurveyResponse.create({
      surveyId,
      userId,
      deviceId: survey.limitByDevice ? deviceId : null,
      ipAddress: req.ip,
      submittedAt: new Date(),
    });

    for (const answerData of answers) {
      await Answer.create({
        responseId: response.id,
        questionId: answerData.questionId,
        answer: answerData.answer,
      });
    }

    res.status(201).json({ message: 'Response submitted successfully', responseId: response.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getSurveyResponses = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user!.id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const responses = await SurveyResponse.findAll({
      where: { surveyId },
      include: [
        {
          model: Answer,
          as: 'answers',
          include: [{ model: Question, as: 'question' }],
        },
      ],
      order: [['submittedAt', 'DESC']],
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getSurveyStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user!.id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const questions = await Question.findAll({
      where: { surveyId },
      include: [
        {
          model: Answer,
          as: 'answers',
          include: [{ model: SurveyResponse, as: 'response' }],
        },
        { model: QuestionOption, as: 'options' },
      ],
    });

    const statistics = questions.map((question) => {
      const stats: any = {
        id: question.id,
        title: question.title,
        type: question.type,
        totalResponses: question.answers.length,
        required: question.isRequired,
      };

      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        stats.options = question.options.map((option) => {
          const count = question.answers.filter((a) => a.answer.includes(option.text)).length;
          return {
            text: option.text,
            count,
            percentage: question.answers.length > 0 ? (count / question.answers.length) * 100 : 0,
          };
        });
      } else if (question.type === 'rating') {
        const ratings = question.answers.map((a) => parseFloat(a.answer)).filter((r) => !isNaN(r));
        stats.average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        stats.distribution = {};
        ratings.forEach((r) => {
          const key = r.toString();
          stats.distribution[key] = (stats.distribution[key] || 0) + 1;
        });
      } else {
        stats.answers = question.answers.map((a) => a.answer);
      }

      return stats;
    });

    res.json({
      surveyId,
      totalResponses: await SurveyResponse.count({ where: { surveyId } }),
      statistics,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
