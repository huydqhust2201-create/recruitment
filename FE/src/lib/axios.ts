import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error('Refresh failed'));
    else resolve(token);
  });
  refreshQueue = [];
}

function clearAuthAndRedirect(reason?: string) {
  if (typeof window === 'undefined') return;
  localStorage.clear();
  document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax';
  const url = reason ? `/login?reason=${reason}` : '/login';
  window.location.href = url;
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Có lỗi xảy ra';

    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/register')
    ) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAuthAndRedirect('session_expired');
        return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        saveTokens(res.data.accessToken, res.data.refreshToken);
        processQueue(null, res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError instanceof Error ? refreshError : new Error('Refresh failed'), null);
        clearAuthAndRedirect('session_expired');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export default axiosInstance;
