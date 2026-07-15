<template>
  <header class="topbar">
    <div class="topbar__title">{{ title }}</div>
    <div class="topbar__actions">
      <div class="search">
        <span>🔍</span>
        <input type="text" placeholder="Buscar..." />
      </div>
      <button class="icon-btn" title="Notificaciones">
        🔔<span class="badge">3</span>
      </button>
      <button class="icon-btn" title="Configuración">⚙️</button>
      <div class="menu-wrap">
        <button class="icon-btn" @click="open = !open" title="Cuenta">👤</button>
        <div v-if="open" class="menu">
          <div class="menu__user">
            <strong>{{ auth.usuario?.nombre_usuario }}</strong>
            <span class="muted">{{ auth.usuario?.rol?.nombre_rol }}</span>
          </div>
          <button class="menu__item" @click="salir">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';

defineProps({ title: { type: String, default: '' } });

const auth = useAuthStore();
const router = useRouter();
const open = ref(false);

function salir() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.menu-wrap { position: relative; }
.menu {
  position: absolute; right: 0; top: 42px; width: 200px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; box-shadow: var(--shadow); overflow: hidden; z-index: 20;
}
.menu__user { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; }
.menu__item {
  width: 100%; text-align: left; padding: 12px 16px; background: transparent;
  border: none; color: var(--text); cursor: pointer; font-size: 14px;
}
.menu__item:hover { background: rgba(255,255,255,.04); color: var(--accent); }
</style>
