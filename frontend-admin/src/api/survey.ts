import request from './index';

export interface Survey {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id?: number;
  type: 'single' | 'multiple' | 'text' | 'rating';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  order: number;
}

export const surveyApi = {
  // List surveys
  list: (params: { page?: number; pageSize?: number; status?: string }) =>
    request.get('/surveys', { params }),

  // Get survey detail
  get: (id: number) => request.get(`/surveys/${id}`),

  // Create survey
  create: (data: Partial<Survey>) => request.post('/surveys', data),

  // Update survey
  update: (id: number, data: Partial<Survey>) => request.put(`/surveys/${id}`, data),

  // Delete survey
  delete: (id: number) => request.delete(`/surveys/${id}`),

  // Add question
  addQuestion: (surveyId: number, data: Question) =>
    request.post(`/surveys/${surveyId}/questions`, data),

  // Update question
  updateQuestion: (questionId: number, data: Partial<Question>) =>
    request.put(`/surveys/questions/${questionId}`, data),

  // Delete question
  deleteQuestion: (questionId: number) =>
    request.delete(`/surveys/questions/${questionId}`),
};
