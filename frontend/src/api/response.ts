import api from './index';

export interface Answer {
  questionId: number;
  answer: string;
}

export interface ResponseLimitCheck {
  canSubmit: boolean;
  reason?: string;
  currentCount: number;
  limit?: number;
  userResponseCount: number;
  maxResponsesPerUser: number;
}

export interface CrossAnalysisParams {
  questionX: number;
  questionY: number;
}

export interface CrossAnalysisResponse {
  surveyId: string;
  questionX: { id: number; title: string; type: string };
  questionY: { id: number; title: string; type: string };
  xOptions: string[];
  yOptions: string[];
  tableData: Record<string, Record<string, { count: number; percentage: number }>>;
}

export const responseAPI = {
  submitResponse: (surveyId: string, answers: Answer[], deviceId?: string) =>
    api.post(`/surveys/${surveyId}/responses`, { answers, deviceId }),

  getSurveyResponses: (surveyId: string) =>
    api.get(`/surveys/${surveyId}/responses`),

  getSurveyStatistics: (surveyId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/surveys/${surveyId}/statistics`, { params }),

  checkResponseLimit: (surveyId: string) =>
    api.get<ResponseLimitCheck>(`/surveys/${surveyId}/responses/check-limit`),

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

  getCrossAnalysis: (surveyId: string, params: CrossAnalysisParams) =>
    api.get<CrossAnalysisResponse>(`/surveys/${surveyId}/cross-analysis`, { params }),
};
