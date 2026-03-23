import { Response, Request } from 'express';
import { Response as SurveyResponse, Answer, Question, Survey, QuestionOption } from '../models';
import { AuthRequest } from '../types';

export const submitResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const { answers, deviceId } = req.body;
    const userId = req.user?.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    const survey = await Survey.findByPk(surveyIdStr);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status !== 'published') {
      return res.status(400).json({ error: 'Survey is not available' });
    }

    // 检查截止时间
    if (survey.deadline && new Date(survey.deadline) < new Date()) {
      return res.status(400).json({ error: 'Survey has expired' });
    }

    if (survey.requireLogin && !userId) {
      return res.status(401).json({ error: 'Login required' });
    }

    if (!survey.allowAnonymous && !userId) {
      return res.status(401).json({ error: 'Anonymous responses not allowed' });
    }

    if (survey.limitByDevice && deviceId) {
      const existingResponse = await SurveyResponse.findOne({
        where: { surveyId: surveyIdStr, deviceId },
      });
      if (existingResponse) {
        return res.status(400).json({ error: 'This device has already submitted a response' });
      }
    }

    const questions = await Question.findAll({
      where: { surveyId: surveyIdStr },
      include: [{ model: QuestionOption, as: 'options' }],
    });

    for (const question of questions) {
      const answer = answers.find((a: any) => a.questionId === question.id);

      if (question.isRequired && (!answer || !answer.answer)) {
        return res.status(400).json({ error: `Question "${question.title}" is required` });
      }
    }

    const response = await SurveyResponse.create({
      surveyId: surveyIdStr,
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
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    const survey = await Survey.findByPk(surveyIdStr);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const responses = await SurveyResponse.findAll({
      where: { surveyId: surveyIdStr },
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
    const { startDate, endDate } = req.query;
    const userId = req.user!.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    const survey = await Survey.findByPk(surveyIdStr);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 构建时间筛选条件
    const responseWhere: any = { surveyId: surveyIdStr };
    if (startDate || endDate) {
      const { Op } = await import('sequelize');
      responseWhere.submittedAt = {};
      if (startDate) {
        responseWhere.submittedAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        // 结束日期包含当天的所有时间
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        responseWhere.submittedAt[Op.lte] = endDateTime;
      }
    }

    // 导入 Response 模型
    const { Response: SurveyResponse } = await import('../models');

    const questions = await Question.findAll({
      where: { surveyId: surveyIdStr },
      include: [
        {
          model: Answer,
          as: 'answers',
          include: [{
            model: SurveyResponse,
            as: 'response',
            where: startDate || endDate ? responseWhere : undefined,
            required: false,
          }],
        },
        { model: QuestionOption, as: 'options' },
      ],
    });

    const statistics = questions.map((question: any) => {
      // 只统计符合时间条件的答案
      const filteredAnswers = question.answers?.filter((a: any) => {
        if (!startDate && !endDate) return true;
        return a.response !== null;
      }) || [];

      const stats: any = {
        id: question.id,
        title: question.title,
        type: question.type,
        totalResponses: filteredAnswers.length,
        required: question.isRequired,
      };

      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        stats.options = question.options?.map((option: any) => {
          const count = filteredAnswers.filter((a: any) => a.answer.includes(option.text)).length || 0;
          return {
            text: option.text,
            count,
            percentage: filteredAnswers.length > 0 ? (count / filteredAnswers.length) * 100 : 0,
          };
        });
      } else if (question.type === 'rating') {
        const ratings = filteredAnswers.map((a: any) => parseFloat(a.answer)).filter((r: any) => !isNaN(r)) || [];
        stats.average = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        stats.distribution = {};
        ratings.forEach((r: number) => {
          const key = r.toString();
          stats.distribution[key] = (stats.distribution[key] || 0) + 1;
        });
      } else {
        stats.answers = filteredAnswers.map((a: any) => a.answer) || [];
      }

      return stats;
    });

    // 计算筛选后的总回复数
    const totalResponses = await SurveyResponse.count({
      where: responseWhere,
    });

    res.json({
      surveyId,
      totalResponses,
      statistics,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
