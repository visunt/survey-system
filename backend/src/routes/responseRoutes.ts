import { Router } from 'express';
import { submitResponse, getSurveyResponses, getSurveyStatistics, checkResponseLimit, getCrossAnalysis } from '../controllers/responseController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Check response limit (optional auth)
router.get('/surveys/:surveyId/responses/check-limit', optionalAuth, checkResponseLimit);

// Submit response (optional auth - depends on survey settings)
router.post('/surveys/:surveyId/responses', optionalAuth, submitResponse);

// Get responses and statistics (protected)
router.get('/surveys/:surveyId/responses', authMiddleware, getSurveyResponses);
router.get('/surveys/:surveyId/statistics', authMiddleware, getSurveyStatistics);

// Cross analysis (protected)
router.get('/surveys/:surveyId/cross-analysis', authMiddleware, getCrossAnalysis);

export default router;
