import api from './index';

export interface Answer {
  questionId: number;
  answer: string;
}

export const responseAPI = {
  submitResponse: (surveyId: string, answers: Answer[], deviceId?: string) =>
    api.post(`/surveys/${surveyId}/responses`, { answers, deviceId }),

  getSurveyResponses: (surveyId: string) =>
    api.get(`/surveys/${surveyId}/responses`),

  getSurveyStatistics: (surveyId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/surveys/${surveyId}/statistics`, { params }),

  exportToExcel: (surveyId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/surveys/${surveyId}/export/excel`, {
      params,
      responseType: 'blob',
    }),

  exportToPdf: (surveyId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/surveys/${surveyId}/export/pdf`, {
      params,
      responseType: 'blob',
    }),
};
