import api from './index';

export interface TemplateQuestion {
  title: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'textarea' | 'rating' | 'date' | 'dropdown_single' | 'dropdown_multiple' | 'switch';
  isRequired: boolean;
  orderIndex: number;
  options?: Array<{ text: string; orderIndex: number }>;
}

export interface Template {
  id?: string;
  title: string;
  description?: string;
  category: 'satisfaction' | 'event' | 'feedback' | 'research' | 'other';
  questions?: TemplateQuestion[];
  isSystem: boolean;
  creatorId: number;
  usageCount: number;
  questionCount?: number;
  creator?: {
    id: number;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const templateAPI = {
  // 获取模板列表
  getTemplates: (params?: { category?: string; type?: 'system' | 'my' | 'all' }) =>
    api.get('/templates', { params }),

  // 获取模板详情
  getTemplateById: (id: string) => api.get(`/templates/${id}`),

  // 创建模板（从问卷保存）
  createTemplate: (data: Template) => api.post('/templates', data),

  // 从模板创建问卷
  createSurveyFromTemplate: (id: string, data?: { title?: string; description?: string }) =>
    api.post(`/templates/from-template/${id}`, data),

  // 更新模板
  updateTemplate: (id: string, data: Partial<Template>) => api.put(`/templates/${id}`, data),

  // 删除模板
  deleteTemplate: (id: string) => api.delete(`/templates/${id}`),
};

export default templateAPI;
