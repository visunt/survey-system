import { Router } from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  createSurveyFromTemplate,
  deleteTemplate,
  updateTemplate,
} from '../controllers/templateController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有模板接口都需要认证
router.use(authMiddleware);

// 获取模板列表
router.get('/', getTemplates);

// 获取模板详情
router.get('/:id', getTemplateById);

// 创建模板（从问卷保存）
router.post('/', createTemplate);

// 从模板创建问卷
router.post('/from-template/:id', createSurveyFromTemplate);

// 更新模板
router.put('/:id', updateTemplate);

// 删除模板
router.delete('/:id', deleteTemplate);

export default router;
