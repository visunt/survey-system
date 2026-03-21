import { Response, Request } from 'express';
import { SurveyTemplate } from '../models';
import { AuthRequest } from '../types';
import { generateId } from '../utils/generateId';

// 获取模板列表
export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, type } = req.query;

    const where: any = {};

    // 类型筛选: system(系统模板) | my(我的模板) | all(全部)
    if (type === 'system') {
      where.isSystem = true;
    } else if (type === 'my') {
      where.isSystem = false;
      where.creatorId = userId;
    } else if (type !== 'all') {
      // 默认返回系统模板和我的模板
      where.$or = [
        { isSystem: true },
        { creatorId: userId },
      ];
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    const templates = await SurveyTemplate.findAll({
      where,
      include: [
        {
          model: SurveyTemplate.sequelize!.models.User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
      order: [['isSystem', 'DESC'], ['usageCount', 'DESC'], ['createdAt', 'DESC']],
    });

    // 计算每个模板的题目数量
    const templatesWithQuestionCount = templates.map(template => {
      const questions = template.getDataValue('questions');
      const questionCount = Array.isArray(questions) ? questions.length : 0;

      return {
        ...template.toJSON(),
        questionCount,
      };
    });

    res.json(templatesWithQuestionCount);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 获取模板详情
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = Array.isArray(id) ? id[0] : id;

    const template = await SurveyTemplate.findByPk(templateId, {
      include: [
        {
          model: SurveyTemplate.sequelize!.models.User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const questions = template.getDataValue('questions');
    const questionCount = Array.isArray(questions) ? questions.length : 0;

    res.json({
      ...template.toJSON(),
      questionCount,
    });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 创建模板（从问卷保存）
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, category, questions } = req.body;

    if (!title || !category || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await SurveyTemplate.create({
      id: generateId(12),
      title,
      description,
      category,
      questions,
      isSystem: false,
      creatorId: userId,
      usageCount: 0,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 从模板创建问卷
export const createSurveyFromTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const templateId = Array.isArray(id) ? id[0] : id;
    const { title, description } = req.body; // 可选的覆盖标题和描述

    const template = await SurveyTemplate.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 增加模板使用次数
    await template.increment('usageCount');

    // 获取题目数据
    const templateQuestions = template.getDataValue('questions');

    // 获取 Survey 模型
    const { Survey, Question, QuestionOption } = await import('../models');

    // 创建问卷
    const survey = await Survey.create({
      title: title || template.title,
      description: description || template.description,
      creatorId: userId,
      status: 'draft',
      allowAnonymous: true,
      requireLogin: false,
    });

    // 创建题目
    if (Array.isArray(templateQuestions) && templateQuestions.length > 0) {
      for (const questionData of templateQuestions) {
        const question = await Question.create({
          surveyId: survey.id,
          title: questionData.title,
          type: questionData.type,
          isRequired: questionData.isRequired ?? true,
          orderIndex: questionData.orderIndex,
        });

        // 创建选项
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

    // 返回完整的问卷数据
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
    console.error('Error creating survey from template:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 删除模板
export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = Array.isArray(id) ? id[0] : id;
    const userId = req.user!.id;

    const template = await SurveyTemplate.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 系统模板不能删除
    if (template.isSystem) {
      return res.status(403).json({ error: 'Cannot delete system template' });
    }

    // 只能删除自己的模板
    if (template.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await template.destroy();

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 更新模板
export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = Array.isArray(id) ? id[0] : id;
    const userId = req.user!.id;
    const { title, description, category, questions } = req.body;

    const template = await SurveyTemplate.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 系统模板不能修改
    if (template.isSystem) {
      return res.status(403).json({ error: 'Cannot modify system template' });
    }

    // 只能修改自己的模板
    if (template.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await template.update({
      title: title || template.title,
      description: description !== undefined ? description : template.description,
      category: category || template.category,
      questions: questions !== undefined ? questions : template.questions,
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
