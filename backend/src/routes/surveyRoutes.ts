import { Router } from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
} from '../controllers/surveyController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getSurveys);
router.get('/:id', getSurveyById);

// Protected routes
router.post('/', authMiddleware, createSurvey);
router.put('/:id', authMiddleware, updateSurvey);
router.delete('/:id', authMiddleware, deleteSurvey);
router.patch('/:id/publish', authMiddleware, publishSurvey);

export default router;
