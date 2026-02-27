import express, { Router } from 'express';
import { body, param } from 'express-validator';

const router: Router = express.Router();

// Validation rules
const surveyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'published', 'closed']),
];

const questionValidation = [
  body('surveyId').isInt().withMessage('Survey ID must be an integer'),
  body('type').isIn(['single', 'multiple', 'text', 'rating']).withMessage('Invalid question type'),
  body('title').trim().notEmpty().withMessage('Question title is required'),
];

// Routes
router.get('/', (req, res) => {
  res.json({ message: 'List surveys endpoint - implement with controller' });
});

router.get('/:id', param('id').isInt(), (req, res) => {
  res.json({ message: 'Get survey endpoint - implement with controller' });
});

router.post('/', surveyValidation, (req, res) => {
  res.json({ message: 'Create survey endpoint - implement with controller' });
});

router.put('/:id', param('id').isInt(), surveyValidation, (req, res) => {
  res.json({ message: 'Update survey endpoint - implement with controller' });
});

router.delete('/:id', param('id').isInt(), (req, res) => {
  res.json({ message: 'Delete survey endpoint - implement with controller' });
});

// Questions
router.post('/:id/questions', param('id').isInt(), questionValidation, (req, res) => {
  res.json({ message: 'Add question endpoint - implement with controller' });
});

router.put('/questions/:questionId', param('questionId').isInt(), questionValidation, (req, res) => {
  res.json({ message: 'Update question endpoint - implement with controller' });
});

router.delete('/questions/:questionId', param('questionId').isInt(), (req, res) => {
  res.json({ message: 'Delete question endpoint - implement with controller' });
});

export default router;
