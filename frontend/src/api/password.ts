import api from './index';

export const passwordAPI = {
  forgotPassword: (email: string) =>
    api.post('/password/forgot', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/password/reset', { token, password }),

  verifyToken: (token: string) =>
    api.get(`/password/verify/${token}`),
};
