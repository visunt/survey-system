import api from './index';

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  usageCount: number;
  isSystem: boolean;
  questions?: any[];
}

export interface TemplateCategory {
  value: string;
  label: string;
}

export const templateAPI = {
  getTemplates: (category?: string) => {
    const params = category && category !== 'all' ? { category } : {};
    return api.get<Template[]>('/templates', { params });
  },

  getTemplateById: (id: number) => 
    api.get<Template>(`/templates/${id}`),

  getCategories: () => 
    api.get<TemplateCategory[]>('/templates/categories'),
};
