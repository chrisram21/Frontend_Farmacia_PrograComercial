import { defineStore } from 'pinia';
import api from '../services/api.js';
import { ROLES } from '../config/roles.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  }),
  getters: {
    isAuth: (s) => !!s.token,
    rol: (s) => s.usuario?.rol?.nombre_rol || null,
  },
  actions: {
    /**
    * Indica si el usuario actual puede realizar una accion segun su rol. El
    * Administrador siempre puede (acceso total). Solo mejora la experiencia
    * (ocultar/deshabilitar); el backend sigue siendo la fuente de verdad.
    *
    * @param {string[]} rolesPermitidos roles autorizados para la accion
    * @returns {boolean} true si el usuario tiene alguno de esos roles
    **/
    puede(rolesPermitidos = []) {
      if (!this.rol) return false;
      if (this.rol === ROLES.ADMIN) return true;
      return rolesPermitidos.includes(this.rol);
    },
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
