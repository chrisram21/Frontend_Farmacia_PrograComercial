<template>
  <div class="login-wrap">
    <div class="login-card">
      <h1><span class="logo">💊</span> FarmaSys</h1>
      <p class="sub">Ingresa a tu cuenta para continuar</p>

      <div v-if="error" class="error-text">{{ error }}</div>

      <div class="field">
        <label>Usuario</label>
        <input v-model="user" type="text" placeholder="admin" @keyup.enter="entrar" />
      </div>
      <div class="field">
        <label>Contraseña</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="entrar" />
      </div>

      <button class="btn btn--primary" style="width:100%; justify-content:center; margin-top:8px"
              :disabled="loading" @click="entrar">
        {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
      </button>

      <p class="muted" style="margin-top:18px; font-size:12px; text-align:center">
        Demo: admin / admin123
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();

const user = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function entrar() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(user.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo iniciar sesión';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-card .logo {
  width: 30px; height: 30px; border-radius: 8px; background: var(--accent);
  display: inline-grid; place-items: center; font-size: 16px;
}
</style>
