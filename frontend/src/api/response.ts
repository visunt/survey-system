import api from './index';

export interface Answer {
  questionId: number;
  answer: string;
}

export const responseAPI = {
  submitResponse: (surveyId: number, answers: Answer[], deviceId?: string) =>
    api.post(`/surveys/${surveyId}/responses`, { answers, deviceId }),

  getSurveyResponses: (surveyId: number) =>
    api.get(`/surveys/${surveyId}/responses`),

  getSurveyStatistics: (surveyId: number) =>
    api.get(`/surveys/${surveyId}/statistics`),
};
