import { Request } from 'express';

export interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  loginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SurveyAttributes {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  creatorId: number;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  responseLimit?: number;
  maxResponsesPerUser: number;
  allowAnonymous: boolean;
  requireLogin: boolean;
  limitByDevice?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionAttributes {
  id?: number;
  surveyId: string;
  title: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'textarea' | 'rating' | 'date' | 'dropdown_single' | 'dropdown_multiple' | 'switch';
  isRequired: boolean;
  orderIndex: number;
  skipLogic?: SkipLogic;
  displayLogic?: DisplayLogic;
  validationRules?: ValidationRule[];
  options?: QuestionOptionAttributes[];
  createdAt?: Date;
  updatedAt?: Date;
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

// 显示逻辑类型定义
export interface DisplayLogic {
  enabled: boolean;
  conditions: DisplayCondition[];
  logic: 'and' | 'or';
}

export interface DisplayCondition {
  questionId: number;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
}

// 验证规则类型定义
export interface ValidationRule {
  type: 'phone' | 'email' | 'idcard' | 'number_range' | 'text_length' | 'regex' | 'date_range';
  config?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface QuestionOptionAttributes {
  id?: number;
  questionId: number;
  text: string;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResponseAttributes {
  id?: number;
  surveyId: string;
  userId?: number;
  deviceId?: string;
  ipAddress?: string;
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnswerAttributes {
  id?: number;
  responseId: number;
  questionId: number;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateAttributes {
  id?: string;
  title: string;
  description?: string;
  category: 'satisfaction' | 'event' | 'feedback' | 'research' | 'other';
  questions: any; // JSON storing questions data
  isSystem: boolean;
  creatorId: number;
  usageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}
