import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export class SurveyController {
  async list(req: AuthRequest, res: Response) {
    // TODO: Implement with Prisma
    res.json({
      success: true,
      data: {
        surveys: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    // TODO: Implement with Prisma
    res.json({ success: true, data: { id, title: 'Sample Survey' } });
  }

  async create(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, status = 'draft' } = req.body;
    // TODO: Implement with Prisma
    res.json({
      success: true,
      message: 'Survey created',
      data: { id: 1, title, description, status },
    });
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // TODO: Implement with Prisma
    res.json({ success: true, message: 'Survey updated', data: { id, ...req.body } });
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    // TODO: Implement with Prisma
    res.json({ success: true, message: 'Survey deleted', data: { id } });
  }

  async addQuestion(req: AuthRequest, res: Response) {
    const { id } = req.params;
    // TODO: Implement with Prisma
    res.json({
      success: true,
      message: 'Question added',
      data: { surveyId: id, ...req.body },
    });
  }

  async updateQuestion(req: AuthRequest, res: Response) {
    const { questionId } = req.params;
    // TODO: Implement with Prisma
    res.json({
      success: true,
      message: 'Question updated',
      data: { questionId, ...req.body },
    });
  }

  async deleteQuestion(req: AuthRequest, res: Response) {
    const { questionId } = req.params;
    // TODO: Implement with Prisma
    res.json({ success: true, message: 'Question deleted', data: { questionId } });
  }
}
