import api from './index';

export interface QuestionOption {
  id?: number;
  text: string;
  orderIndex: number;
}

export interface SkipLogic {
  enabled: boolean;
  conditions: SkipCondition[];
  action: 'skip' | 'end' | 'jump_to';
  targetQuestionId?: number;
}

export interface SkipCondition {
  questionId: number;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface Question {
  id?: number;
  title: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'textarea' | 'rating' | 'date' | 'dropdown_single' | 'dropdown_multiple' | 'switch';
  isRequired: boolean;
  orderIndex: number;
  skipLogic?: SkipLogic;
  options?: QuestionOption[];
}

export interface Survey {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  creatorId?: number;
  startDate?: string;
  endDate?: string;
  allowAnonymous: boolean;
  requireLogin: boolean;
  limitByDevice?: boolean;
  questions?: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export const surveyAPI = {
  getSurveys: (params?: { status?: string; creatorId?: number }) =>
    api.get('/surveys', { params }),

  getSurveyById: (id: string) => api.get(`/surveys/${id}`),

  createSurvey: (data: Survey) => api.post('/surveys', data),

  updateSurvey: (id: string, data: Survey) => api.put(`/surveys/${id}`, data),

  deleteSurvey: (id: string) => api.delete(`/surveys/${id}`),

  publishSurvey: (id: string) => api.patch(`/surveys/${id}/publish`),
};

export default surveyAPI;
