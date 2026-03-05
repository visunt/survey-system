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

  getSurveyStatistics: (surveyId: string) =>
    api.get(`/surveys/${surveyId}/statistics`),
};
