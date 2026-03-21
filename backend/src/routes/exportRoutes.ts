import { Router } from 'express';
import { exportToExcel, exportToPdf } from '../controllers/exportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 导出统计报告
router.get('/surveys/:surveyId/export/excel', authMiddleware, exportToExcel);
router.get('/surveys/:surveyId/export/pdf', authMiddleware, exportToPdf);

export default router;
