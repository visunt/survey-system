import { get, post } from '@/utils/request';

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
  get: (id: number) => get<Survey>(`/surveys/${id}`),
};

export const responseApi = {
  submit: (surveyId: number, answers: any) =>
    post('/responses', { surveyId, answers }),
};
