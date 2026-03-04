import { Router } from 'express';
import { submitResponse, getSurveyResponses, getSurveyStatistics } from '../controllers/responseController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Submit response (optional auth - depends on survey settings)
router.post('/surveys/:surveyId/responses', optionalAuth, submitResponse);

// Get responses and statistics (protected)
router.get('/surveys/:surveyId/responses', authMiddleware, getSurveyResponses);
router.get('/surveys/:surveyId/statistics', authMiddleware, getSurveyStatistics);

export default router;
