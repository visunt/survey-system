import request from './index';

export interface Answer {
  questionId: number;
  value: string | string[];
}

export const responseApi = {
  // List responses for a survey
  list: (surveyId: number, params: { page?: number; pageSize?: number }) =>
    request.get(`/responses/survey/${surveyId}`, { params }),

  // Get response detail
  get: (id: number) => request.get(`/responses/${id}`),

  // Get statistics
  getStats: (surveyId: number) => request.get(`/responses/survey/${surveyId}/stats`),

  // Export responses
  export: (surveyId: number, format: 'csv' | 'excel' = 'csv') =>
    request.get(`/responses/survey/${surveyId}/export`, { params: { format } }),
};
