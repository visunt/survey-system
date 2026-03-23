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
  deadline?: string;
  allowAnonymous: boolean;
  requireLogin: boolean;
  limitByDevice?: boolean;
  questions?: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveyResponse {
  id: number;
  surveyId: string;
  userId?: number;
  submittedAt: string;
  survey?: Survey;
}

export interface SurveyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface SurveyListResponse {
  data: Survey[];
  total: number;
  page: number;
  pageSize: number;
}

export const surveyAPI = {
  getSurveys: (params?: { status?: string; creatorId?: number }) =>
    api.get('/surveys', { params }),

  getMySurveys: (params?: SurveyListParams) =>
    api.get<SurveyListResponse>('/surveys/my/surveys', { params }),

  getMyResponses: () => api.get('/surveys/my/responses'),

  getSurveyById: (id: string) => api.get(`/surveys/${id}`),

  createSurvey: (data: Survey) => api.post('/surveys', data),

  updateSurvey: (id: string, data: Survey) => api.put(`/surveys/${id}`, data),

  deleteSurvey: (id: string) => api.delete(`/surveys/${id}`),

  publishSurvey: (id: string) => api.patch(`/surveys/${id}/publish`),

  reorderQuestions: (surveyId: string, questionOrders: Array<{ id: number; orderIndex: number }>) =>
    api.patch(`/surveys/${surveyId}/questions/reorder`, { questionOrders }),

  duplicateSurvey: (id: string) => api.post(`/surveys/${id}/duplicate`),
};

export default surveyAPI;
