import express, { Router } from 'express';
import { body, param } from 'express-validator';

const router: Router = express.Router();

// Validation rules
const submitValidation = [
  body('surveyId').isInt().withMessage('Survey ID must be an integer'),
  body('answers').isArray().withMessage('Answers must be an array'),
];

// Routes
router.get('/survey/:surveyId', param('surveyId').isInt(), (req, res) => {
  res.json({ message: 'List responses for survey - implement with controller' });
});

router.get('/:id', param('id').isInt(), (req, res) => {
  res.json({ message: 'Get response detail - implement with controller' });
});

router.post('/', submitValidation, (req, res) => {
  res.json({ message: 'Submit response endpoint - implement with controller' });
});

router.get('/survey/:surveyId/stats', param('surveyId').isInt(), (req, res) => {
  res.json({ message: 'Survey statistics endpoint - implement with controller' });
});

router.get('/survey/:surveyId/export', param('surveyId').isInt(), (req, res) => {
  res.json({ message: 'Export responses endpoint - implement with controller' });
});

export default router;
