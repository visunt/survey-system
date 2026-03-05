import api from './index';

export const authAPI = {
  register: (data: { 
    username: string; 
    email: string; 
    password: string;
    captchaId: string;
    captchaCode: string;
  }) => api.post('/auth/register', data),

  login: (data: { 
    email: string; 
    password: string;
    captchaId?: string;
    captchaCode?: string;
  }) => api.post('/auth/login', data),

  getProfile: () => api.get('/auth/profile'),

  checkCaptchaRequired: (email: string) => 
    api.get('/auth/check-captcha', { params: { email } }),

  getCaptcha: () => api.get('/captcha'),
};
