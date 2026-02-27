import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('Please login first');
      localStorage.removeItem('token');
      router.push('/login');
    } else {
      ElMessage.error(error.response?.data?.message || 'Request failed');
    }
    return Promise.reject(error);
  }
);

export default instance;

export const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config);
};
