import request from './index';

export interface Question {
  id: number;
  type: 'single' | 'multiple' | 'text' | 'rating';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  order: number;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

export const surveyApi = {
  get: (id: number) => request.get<Survey>(`/surveys/${id}`),
};

export const responseApi = {
  submit: (surveyId: number, answers: any) =>
    request.post('/responses', { surveyId, answers }),
};
