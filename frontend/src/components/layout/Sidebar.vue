<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <span class="logo">💊</span>
      <span>FarmaSys</span>
    </div>

    <div class="sidebar__section">General</div>
    <router-link class="nav-item" to="/"><span class="ico">▦</span> Dashboard</router-link>
    <router-link class="nav-item" to="/medicamentos"><span class="ico">💊</span> Medicamentos</router-link>
    <router-link v-if="auth.puede([ROLES.VENDEDOR])" class="nav-item" to="/ventas"><span class="ico">🧾</span> Ventas</router-link>

    <div class="sidebar__section">Catálogos</div>
    <router-link class="nav-item" to="/clientes"><span class="ico">👤</span> Clientes</router-link>
    <router-link v-if="auth.puede([ROLES.BODEGUERO])" class="nav-item" to="/proveedores"><span class="ico">🚚</span> Proveedores</router-link>
    <router-link class="nav-item" to="/presentaciones"><span class="ico">📦</span> Presentaciones</router-link>
    <router-link class="nav-item" to="/metodos-pago"><span class="ico">💳</span> Métodos de pago</router-link>

    <template v-if="auth.puede([])">
      <div class="sidebar__section">Administración</div>
      <router-link class="nav-item" to="/usuarios"><span class="ico">🧑‍💼</span> Usuarios</router-link>
      <router-link class="nav-item" to="/roles"><span class="ico">🛡️</span> Roles</router-link>
    </template>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth.js';
import { ROLES } from '../../config/roles.js';

const auth = useAuthStore();
</script>
