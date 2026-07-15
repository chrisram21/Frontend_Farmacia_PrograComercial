<template>
  <AppLayout title="¡Bienvenido!">
    <div class="banner">
      Panel de control de FarmaSys — resumen general de tu farmacia.
    </div>

    <div class="grid grid-4">
      <StatCard icon="🧾" label="Total de ventas" :value="stats.ventas" :trend="2.3" period="Última semana" />
      <StatCard icon="💊" label="Medicamentos" :value="stats.medicamentos" :trend="8.1" period="Este mes" />
      <StatCard icon="👤" label="Clientes" :value="stats.clientes" :trend="1.5" period="Este mes" />
      <StatCard icon="💰" label="Ingresos" :value="`Q ${stats.ingresos.toFixed(2)}`" :trend="-3.4" period="Este mes" />
    </div>

    <div class="card panel" style="margin-top:22px">
      <div class="panel__head">
        <div class="panel__title">Ventas recientes</div>
        <router-link class="link-accent" to="/ventas">Ver todas →</router-link>
      </div>
      <div v-if="loading" class="spinner">Cargando…</div>
      <table v-else-if="ventas.length">
        <thead>
          <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Método</th><th>Total</th><th>Estado</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas.slice(0, 6)" :key="v.id_venta">
            <td>{{ v.id_venta }}</td>
            <td>{{ v.fecha_venta }}</td>
            <td>{{ v.cliente?.nombre_cliente }}</td>
            <td>{{ v.detalleMetodoPago?.metodoPago?.nombre_metodo_pago }}</td>
            <td>Q {{ Number(v.total_venta).toFixed(2) }}</td>
            <td>
              <span :class="v.estado_venta ? 'tag tag--green' : 'tag tag--red'">
                {{ v.estado_venta ? 'Completada' : 'Anulada' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">Aún no hay ventas registradas.</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import StatCard from '../components/ui/StatCard.vue';
import api from '../services/api.js';

const loading = ref(true);
const ventas = ref([]);
const stats = reactive({ ventas: 0, medicamentos: 0, clientes: 0, ingresos: 0 });

onMounted(async () => {
  try {
    const [ventasRes, medsRes, clientesRes] = await Promise.all([
      api.get('/ventas'),
      api.get('/medicamentos'),
      api.get('/clientes'),
    ]);
    ventas.value = ventasRes.data;
    stats.ventas = ventasRes.data.length;
    stats.medicamentos = medsRes.data.length;
    stats.clientes = clientesRes.data.length;
    stats.ingresos = ventasRes.data
      .filter((v) => v.estado_venta)
      .reduce((sum, v) => sum + Number(v.total_venta), 0);
  } finally {
    loading.value = false;
  }
});
</script>
