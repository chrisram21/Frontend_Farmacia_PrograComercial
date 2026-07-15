import { defineStore } from 'pinia';
import api from '../services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  }),
  getters: {
    isAuth: (s) => !!s.token,
  },
  actions: {
    async login(user, password) {
      const { data } = await api.post('/auth/login', { user, password });
      this.token = data.token;
      this.usuario = data.usuario;
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    },
  },
});
