import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  // Prioritize admin token for admin routes, otherwise use regular token
  const isAdminRoute = config.url && (
    config.url.includes('/admin') ||
    config.url.includes('/search/orders') ||
    (config.url.includes('/orders') && config.method === 'patch')
  );
  const token = isAdminRoute 
    ? (localStorage.getItem('adminToken') || localStorage.getItem('token'))
    : (localStorage.getItem('token') || localStorage.getItem('adminToken'));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAdminRoute = requestUrl.includes('/admin') || requestUrl.includes('/search/orders');

      if (isAdminRoute) {
        // Admin token is missing, expired, or invalid — clear it and redirect to admin login
        console.warn('[API] Admin 401 on', requestUrl, '— clearing adminToken and redirecting to login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        // Only redirect if not already on the login page
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        // Regular user token expired — clear and redirect to login
        console.warn('[API] User 401 on', requestUrl, '— clearing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
