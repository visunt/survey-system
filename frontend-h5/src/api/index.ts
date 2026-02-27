import axios, { AxiosInstance } from 'axios';

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default instance;
