<template>
  <AppLayout title="Historial de compras">
    <div v-if="loading" class="spinner">Cargando…</div>
    <div v-else-if="error" class="card panel"><div class="empty">{{ error }}</div></div>

    <template v-else>
      <div class="card panel">
        <div class="panel__head">
          <div>
            <div class="panel__title">{{ cliente.nombre_cliente }}</div>
            <div class="muted" style="font-size:13px">NIT: {{ cliente.nit_cliente || 'CF' }}</div>
          </div>
          <router-link class="link-accent" to="/clientes">← Volver a clientes</router-link>
        </div>
      </div>

      <div class="grid grid-3" style="margin-top:22px">
        <StatCard icon="🧾" label="Compras" :value="resumen.totalCompras" />
        <StatCard icon="💰" label="Total gastado" :value="moneda(resumen.totalGastado)" />
        <StatCard icon="📊" label="Promedio por compra" :value="moneda(resumen.promedioCompra)" />
        <StatCard icon="📅" label="Última compra" :value="resumen.ultimaCompra || '—'" />
        <StatCard icon="🚫" label="Ventas anuladas" :value="resumen.anuladas" />
      </div>

      <div class="card panel" style="margin-top:22px">
        <div class="panel__head">
          <div class="panel__title">Compras registradas</div>
        </div>

        <table v-if="ventas.length">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Folio</th>
              <th>Método de pago</th>
              <th>Artículos</th>
              <th>Total</th>
              <th>Estado</th>
              <th style="width:80px">Factura</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in ventas" :key="v.id_venta">
              <td>{{ v.fecha_venta }}</td>
              <td>#{{ v.id_venta }}</td>
              <td>{{ v.detalleMetodoPago?.metodoPago?.nombre_metodo_pago || '—' }}</td>
              <td>{{ v.detalles?.length ?? 0 }}</td>
              <td>{{ moneda(v.total_venta) }}</td>
              <td>
                <span :class="v.estado_venta ? 'tag tag--green' : 'tag tag--red'">
                  {{ v.estado_venta ? 'Completada' : 'Anulada' }}
                </span>
              </td>
              <td>
                <button class="action-btn print" title="Imprimir factura" @click="imprimirFactura(v)">🖨</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty">Este cliente aún no tiene compras registradas.</div>

        <Paginacion :meta="meta" @cambiar="irAPagina" />
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import StatCard from '../components/ui/StatCard.vue';
import Paginacion from '../components/ui/Paginacion.vue';
import api from '../services/api.js';

const LIMITE_COMPRAS = 10;

const route = useRoute();
const router = useRouter();

const cliente = ref({});
const resumen = ref({ totalCompras: 0, totalGastado: 0, promedioCompra: 0, ultimaCompra: null, anuladas: 0 });
const ventas = ref([]);
const meta = ref({ total: 0, page: 1, limit: LIMITE_COMPRAS, totalPages: 0 });
const page = ref(1);
const loading = ref(true);
const error = ref('');

const moneda = (valor) => `Q ${Number(valor ?? 0).toFixed(2)}`;

/**
* Trae el historial del cliente de la ruta: sus datos, el resumen de actividad y
* la página actual de sus compras.
*
* @returns {Promise<void>} actualiza cliente, resumen, ventas y meta
**/
async function cargar() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get(`/clientes/${route.params.id}/ventas`, {
      params: { page: page.value, limit: LIMITE_COMPRAS },
    });
    cliente.value = data.cliente;
    resumen.value = data.resumen;
    ventas.value = data.ventas.data;
    meta.value = data.ventas.meta;
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo cargar el historial';
  } finally {
    loading.value = false;
  }
}

function irAPagina(nueva) {
  page.value = nueva;
  cargar();
}

/**
* Abre el comprobante de una compra en una pestaña nueva, reutilizando la vista
* de factura de la Fase 3.
*
* @param {object} v venta cuyo comprobante se quiere imprimir
**/
function imprimirFactura(v) {
  const { href } = router.resolve({ name: 'factura-venta', params: { id: v.id_venta } });
  window.open(href, '_blank');
}

onMounted(cargar);
</script>
