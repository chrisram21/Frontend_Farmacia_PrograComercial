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

// Si el token expira, redirige al login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.includes('login')) {
      localStorage.removeItem('token');
      location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
