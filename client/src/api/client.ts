import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coolink_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT attempt token refresh on authentication endpoints (login, register, refresh-token, send-otp)
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh-token') ||
      url.includes('/auth/send-otp') ||
      url.includes('/auth/verify-otp');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem('coolink_refresh_token');
        const res = await axios.post(
          '/api/auth/refresh-token',
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem('coolink_access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('coolink_access_token');
        localStorage.removeItem('coolink_refresh_token');
        localStorage.removeItem('coolink_user');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
