import { Response, Request } from 'express';
import { Survey, Question, QuestionOption } from '../models';
import { AuthRequest } from '../types';

export const createSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, allowAnonymous, requireLogin, deadline, questions } = req.body;

    console.log('Creating survey with data:', { title, description, allowAnonymous, requireLogin, deadline, questions });

    const survey = await Survey.create({
      title,
      description,
      creatorId: userId,
      status: 'draft',
      allowAnonymous: allowAnonymous || false,
      requireLogin: requireLogin !== undefined ? requireLogin : true,
      deadline: deadline ? new Date(deadline) : null,
    });

    console.log('Survey created with ID:', survey.id);

    if (questions && Array.isArray(questions)) {
      for (const questionData of questions) {
        const question = await Question.create({
          surveyId: survey.id,
          title: questionData.title,
          type: questionData.type,
          isRequired: questionData.isRequired ?? true,
          orderIndex: questionData.orderIndex,
        });

        if (questionData.options && Array.isArray(questionData.options)) {
          for (const optionData of questionData.options) {
            await QuestionOption.create({
              questionId: question.id,
              text: optionData.text,
              orderIndex: optionData.orderIndex,
            });
          }
        }
      }
    }

    const surveyWithDetails = await Survey.findByPk(survey.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
    });

    res.status(201).json(surveyWithDetails);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getSurveys = async (req: Request, res: Response) => {
  try {
    const { status, creatorId } = req.query;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const surveys = await Survey.findAll({
      where,
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getMySurveys = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, pageSize = 10, search, status } = req.query;

    // 构建查询条件
    const where: any = { creatorId: userId };

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 搜索条件（标题或描述）
    if (search) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // 分页参数
    const limit = parseInt(pageSize as string);
    const offset = (parseInt(page as string) - 1) * limit;

    // 查询总数和分页数据
    const { count, rows } = await Survey.findAndCountAll({
      where,
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page as string),
      pageSize: limit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getMyResponses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { Response, Survey, Question, QuestionOption, Answer } = await import('../models');

    const responses = await Response.findAll({
      where: { userId },
      include: [
        {
          model: Survey,
          as: 'survey',
          include: [
            {
              model: Question,
              as: 'questions',
              include: [{ model: QuestionOption, as: 'options' }],
            },
          ],
        },
      ],
      order: [['submittedAt', 'DESC']],
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getSurveyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
          order: [['orderIndex', 'ASC']],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const updateSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description, status, startDate, endDate, deadline, allowAnonymous, requireLogin, questions } = req.body;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await survey.update({
      title,
      description,
      status,
      startDate,
      endDate,
      deadline: deadline ? new Date(deadline) : null,
      allowAnonymous,
      requireLogin,
    });

    if (questions) {
      // Delete existing questions and options
      await Question.destroy({ where: { surveyId: survey.id } });

      // Create new questions
      for (const questionData of questions) {
        const question = await Question.create({
          surveyId: survey.id,
          title: questionData.title,
          type: questionData.type,
          isRequired: questionData.isRequired ?? true,
          orderIndex: questionData.orderIndex,
        });

        if (questionData.options) {
          for (const optionData of questionData.options) {
            await QuestionOption.create({
              questionId: question.id,
              text: optionData.text,
              orderIndex: optionData.orderIndex,
            });
          }
        }
      }
    }

    const updatedSurvey = await Survey.findByPk(survey.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
    });

    res.json(updatedSurvey);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const deleteSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await survey.destroy();

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const publishSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await survey.update({ status: 'published', startDate: new Date() });

    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const reorderQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { questionOrders } = req.body;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!Array.isArray(questionOrders)) {
      return res.status(400).json({ error: 'Invalid questionOrders' });
    }

    // 批量更新题目的 orderIndex
    for (const item of questionOrders) {
      if (item.id && typeof item.orderIndex === 'number') {
        await Question.update(
          { orderIndex: item.orderIndex },
          { where: { id: item.id, surveyId: surveyId } }
        );
      }
    }

    res.json({ message: 'Questions reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const duplicateSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const surveyId = Array.isArray(id) ? id[0] : id;

    // 获取原问卷及其问题和选项
    const originalSurvey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
    });

    if (!originalSurvey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // 创建新问卷
    const newSurvey = await Survey.create({
      title: originalSurvey.title + '（副本）',
      description: originalSurvey.description,
      creatorId: userId,
      status: 'draft',
      allowAnonymous: originalSurvey.allowAnonymous,
      requireLogin: originalSurvey.requireLogin,
      limitByDevice: originalSurvey.limitByDevice,
      deadline: originalSurvey.deadline,
    });

    // 复制所有问题
    const surveyData = originalSurvey as any;
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      for (const questionData of surveyData.questions) {
        const question = await Question.create({
          surveyId: newSurvey.id,
          title: questionData.title,
          type: questionData.type,
          isRequired: questionData.isRequired,
          orderIndex: questionData.orderIndex,
        });

        // 复制问题的选项
        if (questionData.options && Array.isArray(questionData.options)) {
          for (const optionData of questionData.options) {
            await QuestionOption.create({
              questionId: question.id,
              text: optionData.text,
              orderIndex: optionData.orderIndex,
            });
          }
        }
      }
    }

    // 返回包含问题和选项的新问卷
    const duplicatedSurvey = await Survey.findByPk(newSurvey.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: QuestionOption, as: 'options' }],
        },
      ],
    });

    res.status(201).json(duplicatedSurvey);
  } catch (error) {
    console.error('Error duplicating survey:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
