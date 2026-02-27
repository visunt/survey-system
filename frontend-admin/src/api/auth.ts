import request from './index';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export const authApi = {
  // Login
  login: (data: LoginData) => request.post<AuthResponse>('/auth/login', data),

  // Register
  register: (data: RegisterData) => request.post('/auth/register', data),

  // Logout
  logout: () => request.post('/auth/logout'),
};
