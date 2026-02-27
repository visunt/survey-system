const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001/api'
  : 'https://your-domain.com/api';

export function request<T>(options: UniApp.RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
      success: (res) => {
        resolve(res.data as T);
      },
      fail: (err) => {
        console.error('Request error:', err);
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

export function get<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'GET', data });
}

export function post<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'POST', data });
}

export function put<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'PUT', data });
}

export function del<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'DELETE', data });
}
