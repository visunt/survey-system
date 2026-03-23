import { Router } from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  getMySurveys,
  getMyResponses,
  reorderQuestions,
  duplicateSurvey,
} from '../controllers/surveyController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/:id', getSurveyById);

// Protected routes
router.get('/my/surveys', authMiddleware, getMySurveys);
router.get('/my/responses', authMiddleware, getMyResponses);
router.post('/', authMiddleware, createSurvey);
router.post('/:id/duplicate', authMiddleware, duplicateSurvey);
router.put('/:id', authMiddleware, updateSurvey);
router.delete('/:id', authMiddleware, deleteSurvey);
router.patch('/:id/publish', authMiddleware, publishSurvey);
router.patch('/:id/questions/reorder', authMiddleware, reorderQuestions);

// Admin/Debug route (keep for now)
router.get('/', getSurveys);

export default router;
