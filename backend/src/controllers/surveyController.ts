import { Response, Request } from 'express';
import { Survey, Question, QuestionOption } from '../models';
import { AuthRequest } from '../types';

export const createSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, allowAnonymous, requireLogin, questions } = req.body;

    console.log('Creating survey with data:', { title, description, allowAnonymous, requireLogin, questions });

    const survey = await Survey.create({
      title,
      description,
      creatorId: userId,
      status: 'draft',
      allowAnonymous: allowAnonymous || false,
      requireLogin: requireLogin !== undefined ? requireLogin : true,
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

    const surveys = await Survey.findAll({
      where: { creatorId: userId },
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
    const { title, description, status, startDate, endDate, allowAnonymous, requireLogin, questions } = req.body;
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
