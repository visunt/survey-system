import { Response, Request } from 'express';
import { Response as SurveyResponse, Answer, Question, Survey, QuestionOption } from '../models';
import { AuthRequest } from '../types';
import { validateAllRules } from '../utils/validation';

export const checkResponseLimit = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user?.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    const survey = await Survey.findByPk(surveyIdStr);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // 获取当前回收数量
    const currentCount = await SurveyResponse.count({
      where: { surveyId: surveyIdStr },
    });

    // 获取用户已填写次数
    let userResponseCount = 0;
    if (userId) {
      userResponseCount = await SurveyResponse.count({
        where: { surveyId: surveyIdStr, userId },
      });
    }

    // 检查是否可以提交
    let canSubmit = true;
    let reason: string | undefined;

    // 检查回收数量上限
    if (survey.responseLimit !== null && survey.responseLimit !== undefined) {
      if (currentCount >= survey.responseLimit) {
        canSubmit = false;
        reason = '该问卷已达到回收数量上限';
      }
    }

    // 检查每人限填次数
    if (canSubmit && survey.maxResponsesPerUser > 0 && userId) {
      if (userResponseCount >= survey.maxResponsesPerUser) {
        canSubmit = false;
        reason = `您已达到该问卷的填写次数上限（${survey.maxResponsesPerUser}次）`;
      }
    }

    res.json({
      canSubmit,
      reason,
      currentCount,
      limit: survey.responseLimit,
      userResponseCount,
      maxResponsesPerUser: survey.maxResponsesPerUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

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

    // 检查回收数量上限
    if (survey.responseLimit !== null && survey.responseLimit !== undefined) {
      const currentCount = await SurveyResponse.count({
        where: { surveyId: surveyIdStr },
      });
      if (currentCount >= survey.responseLimit) {
        return res.status(403).json({ error: '该问卷已达到回收数量上限，无法继续提交' });
      }
    }

    // 检查每人限填次数
    if (survey.maxResponsesPerUser > 0 && userId) {
      const userResponseCount = await SurveyResponse.count({
        where: { surveyId: surveyIdStr, userId },
      });
      if (userResponseCount >= survey.maxResponsesPerUser) {
        return res.status(403).json({ error: `您已达到该问卷的填写次数上限（${survey.maxResponsesPerUser}次）` });
      }
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

      // 验证规则检查
      if (answer && answer.answer && question.validationRules && question.validationRules.length > 0) {
        const validation = validateAllRules(answer.answer, question.validationRules, question.type);
        if (!validation.valid) {
          const errorMessage = validation.messages[0]; // 返回第一个错误信息
          return res.status(400).json({ error: `Question "${question.title}": ${errorMessage}` });
        }
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

// 交叉分析
export const getCrossAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;
    const { questionX, questionY } = req.query;
    const userId = req.user!.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    const survey = await Survey.findByPk(surveyIdStr);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 获取交叉数据 - 使用原生SQL
    const { sequelize } = await import('../config/database');
    const { QueryTypes } = await import('sequelize');
    
    const crossData = await sequelize.query(
      `SELECT a1.answer as x_value, a2.answer as y_value, COUNT(*) as count
       FROM answers a1
       JOIN answers a2 ON a1.responseId = a2.responseId
       JOIN responses r ON a1.responseId = r.id
       WHERE r.surveyId = ? AND a1.questionId = ? AND a2.questionId = ?
       GROUP BY a1.answer, a2.answer`,
      { 
        type: QueryTypes.SELECT, 
        replacements: [surveyIdStr, questionX, questionY] 
      }
    );

    // 获取两个题目的选项
    const [qX, qY] = await Promise.all([
      Question.findByPk(Number(questionX), { include: [{ model: QuestionOption, as: 'options' }] }),
      Question.findByPk(Number(questionY), { include: [{ model: QuestionOption, as: 'options' }] }),
    ]);

    const xOptions = qX?.options?.map((o: any) => o.text) || [];
    const yOptions = qY?.options?.map((o: any) => o.text) || [];

    // 构建交叉表格
    const tableData: Record<string, Record<string, { count: number; percentage: number }>> = {};
    xOptions.forEach((x: string) => {
      tableData[x] = {};
      yOptions.forEach((y: string) => {
        tableData[x][y] = { count: 0, percentage: 0 };
      });
    });

    // 填充数据
    (crossData as any[]).forEach((row: any) => {
      if (tableData[row.x_value] && tableData[row.x_value][row.y_value] !== undefined) {
        tableData[row.x_value][row.y_value].count = parseInt(row.count);
      }
    });

    // 计算行百分比
    Object.keys(tableData).forEach((x) => {
      const rowTotal = Object.values(tableData[x]).reduce((sum, cell) => sum + cell.count, 0);
      Object.keys(tableData[x]).forEach((y) => {
        tableData[x][y].percentage = rowTotal > 0 
          ? Math.round((tableData[x][y].count / rowTotal) * 100 * 10) / 10 
          : 0;
      });
    });

    res.json({
      surveyId,
      questionX: { id: qX?.id, title: qX?.title, type: qX?.type },
      questionY: { id: qY?.id, title: qY?.title, type: qY?.type },
      xOptions,
      yOptions,
      tableData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
