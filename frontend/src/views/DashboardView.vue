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
        <div class="panel__title">Alertas de inventario</div>
        <router-link class="link-accent" to="/medicamentos">Ver medicamentos →</router-link>
      </div>
      <div class="grid grid-3">
        <div v-for="cat in categorias" :key="cat.key" class="card alerta" :class="`alerta--${cat.color}`">
          <div class="alerta__head">
            <div class="alerta__icon">{{ cat.icon }}</div>
            <div>
              <div class="alerta__label">{{ cat.label }}</div>
              <div class="alerta__value">{{ cat.total }}</div>
            </div>
          </div>
          <div v-if="cat.items.length" class="alerta__list">
            <div v-for="med in cat.items.slice(0, 4)" :key="med.id_medicamento" class="alerta__item">
              <span>{{ med.nombre_medicamento }}</span>
              <span>{{ cat.detalle(med) }}</span>
            </div>
            <div v-if="cat.items.length > 4" class="alerta__empty">
              y {{ cat.items.length - 4 }} más…
            </div>
          </div>
          <div v-else class="alerta__empty">Sin medicamentos en esta condición.</div>
        </div>
      </div>
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
          <tr v-for="v in ventas" :key="v.id_venta">
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
import { ref, reactive, computed, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import StatCard from '../components/ui/StatCard.vue';
import api from '../services/api.js';
import { LIMITE_OPCIONES } from '../config/listados.js';

const DIAS_POR_VENCER = 30;
const VENTAS_RECIENTES = 6;

const loading = ref(true);
const ventas = ref([]);
const stats = reactive({ ventas: 0, medicamentos: 0, clientes: 0, ingresos: 0 });
const alertas = reactive({
  stockBajo: { total: 0, items: [] },
  porVencer: { total: 0, items: [] },
  vencidos: { total: 0, items: [] },
});

/**
* Describe los tres indicadores del panel de alertas y los enlaza con la
* respuesta del endpoint. Cada uno define su color, su icono y que dato del
* medicamento se muestra como detalle en el listado.
*
* @returns {Array<object>} indicadores listos para pintar
**/
const categorias = computed(() => [
  {
    key: 'stockBajo',
    icon: '📦',
    label: 'Stock bajo',
    color: 'orange',
    detalle: (med) => `${med.existencia_total} / ${med.stock_minimo}`,
  },
  {
    key: 'porVencer',
    icon: '⏳',
    label: `Por vencer (${DIAS_POR_VENCER} días)`,
    color: 'yellow',
    detalle: (med) => med.fecha_vencimiento,
  },
  {
    key: 'vencidos',
    icon: '⚠️',
    label: 'Vencidos',
    color: 'red',
    detalle: (med) => med.fecha_vencimiento,
  },
].map((cat) => ({ ...cat, total: alertas[cat.key].total, items: alertas[cat.key].items })));

/**
* Carga las métricas del panel. Los conteos salen de `meta.total`, así que a
* medicamentos y clientes se les pide una sola fila: interesa el total, no los
* registros. De ventas sí se trae la primera página completa porque alimenta
* tres cosas a la vez: el conteo, la tabla de ventas recientes y la suma de
* ingresos.
*
* Nota: los ingresos se suman sobre las ventas traídas (las más recientes), no
* sobre el histórico completo. Un total exacto necesita una consulta de
* agregación en el servidor, que corresponde a la fase de reportes.
**/
onMounted(async () => {
  try {
    const soloTotal = { params: { limit: 1 } };
    const [ventasRes, medsRes, clientesRes, alertasRes] = await Promise.all([
      api.get('/ventas', { params: { limit: LIMITE_OPCIONES } }),
      api.get('/medicamentos', soloTotal),
      api.get('/clientes', soloTotal),
      api.get('/medicamentos/alertas', { params: { dias: DIAS_POR_VENCER } }),
    ]);
    ventas.value = ventasRes.data.data.slice(0, VENTAS_RECIENTES);
    stats.ventas = ventasRes.data.meta.total;
    stats.medicamentos = medsRes.data.meta.total;
    stats.clientes = clientesRes.data.meta.total;
    stats.ingresos = ventasRes.data.data
      .filter((v) => v.estado_venta)
      .reduce((sum, v) => sum + Number(v.total_venta), 0);
    Object.assign(alertas, alertasRes.data);
  } finally {
    loading.value = false;
  }
});
</script>
