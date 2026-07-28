import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Adjunta el token JWT en cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && !location.pathname.includes('login')) {
      localStorage.removeItem('token');
      location.href = '/login';
    }
    if (status === 403) {
      alert(err.response?.data?.message || 'No tienes permiso para realizar esta acción');
    }
    return Promise.reject(err);
  }
);

export default api;
