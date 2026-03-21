import { Router } from 'express';
import { getTemplates, getTemplateById, getTemplateCategories } from '../controllers/templateController';

const router = Router();

router.get('/templates', getTemplates);
router.get('/templates/categories', getTemplateCategories);
router.get('/templates/:id', getTemplateById);

export default router;
