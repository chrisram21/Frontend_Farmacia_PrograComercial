import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/medicamentos', name: 'medicamentos', component: () => import('../views/MedicamentosView.vue') },
  { path: '/ventas', name: 'ventas', component: () => import('../views/VentasView.vue') },
  { path: '/clientes', name: 'clientes', component: () => import('../views/ClientesView.vue') },
  { path: '/proveedores', name: 'proveedores', component: () => import('../views/ProveedoresView.vue') },
  { path: '/usuarios', name: 'usuarios', component: () => import('../views/UsuariosView.vue') },
  { path: '/presentaciones', name: 'presentaciones', component: () => import('../views/PresentacionesView.vue') },
  { path: '/metodos-pago', name: 'metodos-pago', component: () => import('../views/MetodosPagoView.vue') },
  { path: '/roles', name: 'roles', component: () => import('../views/RolesView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard: exige sesión salvo en /login.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.name !== 'login' && !auth.isAuth) return { name: 'login' };
  if (to.name === 'login' && auth.isAuth) return { name: 'dashboard' };
});

export default router;
