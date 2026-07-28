import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { ROLES } from '../config/roles.js';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/medicamentos', name: 'medicamentos', component: () => import('../views/MedicamentosView.vue') },
  { path: '/ventas', name: 'ventas', component: () => import('../views/VentasView.vue'),
    meta: { roles: [ROLES.ADMIN, ROLES.VENDEDOR] } },
  { path: '/ventas/:id/factura', name: 'factura-venta', component: () => import('../views/FacturaVenta.vue') },
  { path: '/clientes', name: 'clientes', component: () => import('../views/ClientesView.vue') },
  { path: '/proveedores', name: 'proveedores', component: () => import('../views/ProveedoresView.vue'),
    meta: { roles: [ROLES.ADMIN, ROLES.BODEGUERO] } },
  { path: '/usuarios', name: 'usuarios', component: () => import('../views/UsuariosView.vue'),
    meta: { roles: [ROLES.ADMIN] } },
  { path: '/presentaciones', name: 'presentaciones', component: () => import('../views/PresentacionesView.vue') },
  { path: '/metodos-pago', name: 'metodos-pago', component: () => import('../views/MetodosPagoView.vue') },
  { path: '/roles', name: 'roles', component: () => import('../views/RolesView.vue'),
    meta: { roles: [ROLES.ADMIN] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
* Guard de navegacion: exige sesion en todas las rutas salvo /login y, cuando la
* ruta declara meta.roles, restringe el acceso segun el rol del usuario.
*
* @param {object} to ruta de destino de Vue Router
* @returns {object|undefined} una redireccion si no cumple, o undefined para continuar
**/
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.name !== 'login' && !auth.isAuth) return { name: 'login' };
  if (to.name === 'login' && auth.isAuth) return { name: 'dashboard' };

  if (to.meta?.roles && !auth.puede(to.meta.roles)) {
    return { name: 'dashboard' };
  }
});

export default router;
