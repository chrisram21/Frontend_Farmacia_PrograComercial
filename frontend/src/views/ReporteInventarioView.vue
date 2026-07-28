<template>
  <AppLayout title="Reporte de inventario">
    <div class="card panel no-imprimir">
      <div class="panel__head">
        <div class="panel__title">Estado actual del inventario</div>
        <button class="btn btn--primary" @click="imprimir">🖨 Imprimir / Guardar PDF</button>
      </div>
    </div>

    <div v-if="loading" class="spinner">Cargando…</div>
    <div v-else-if="!reporte" class="card panel" style="margin-top:22px">
      <div class="empty">{{ error || 'No se pudo cargar el reporte.' }}</div>
    </div>

    <template v-else>
      <div class="reporte__titulo">
        Inventario al {{ hoy }}
        <span class="muted">· ventana de vencimiento: {{ DIAS_POR_VENCER }} días</span>
      </div>

      <div class="grid grid-4" style="margin-top:18px">
        <StatCard icon="💊" label="Medicamentos" :value="reporte.resumen.totalMedicamentos" />
        <StatCard icon="📦" label="Unidades en existencia" :value="reporte.resumen.unidadesTotales" />
        <StatCard icon="💰" label="Valor a precio de venta" :value="moneda(reporte.resumen.valorVenta)" />
        <StatCard icon="🏷️" label="Valor a precio mayorista" :value="moneda(reporte.resumen.valorMayorista)" />
      </div>

      <div class="card panel grafica" style="margin-top:22px">
        <div class="panel__head"><div class="panel__title">Unidades por presentación</div></div>
        <div v-if="reporte.porPresentacion.length" class="grafica__lienzo">
          <Bar :data="datosPresentacion" :options="opcionesPresentacion" />
        </div>
        <div v-else class="empty">No hay medicamentos registrados.</div>
      </div>

      <div v-for="bloque in bloques" :key="bloque.clave" class="card panel" style="margin-top:22px">
        <div class="panel__head">
          <div class="panel__title">{{ bloque.titulo }}</div>
          <span :class="`tag ${bloque.etiqueta}`">{{ bloque.items.length }}</span>
        </div>
        <table v-if="bloque.items.length">
          <thead>
            <tr>
              <th>Código</th>
              <th>Medicamento</th>
              <th>Presentación</th>
              <th>Existencia</th>
              <th>Stock mínimo</th>
              <th>Vence</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in bloque.items" :key="m.id_medicamento">
              <td>{{ m.codigo_medicamento }}</td>
              <td>{{ m.nombre_medicamento }}</td>
              <td>{{ m.presentacion?.nombre_presentacion || '—' }}</td>
              <td>{{ m.existencia_total }}</td>
              <td>{{ m.stock_minimo }}</td>
              <td>{{ m.fecha_vencimiento || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty">{{ bloque.vacio }}</div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Bar } from 'vue-chartjs';
import AppLayout from '../components/layout/AppLayout.vue';
import StatCard from '../components/ui/StatCard.vue';
import api from '../services/api.js';
import { SERIE, opcionesEjes } from '../config/graficas.js';

const DIAS_POR_VENCER = 30;

const loading = ref(true);
const reporte = ref(null);
const error = ref('');

const moneda = (valor) => `Q ${Number(valor ?? 0).toFixed(2)}`;

const hoy = new Date().toLocaleDateString('es-GT');

const bloques = computed(() => [
  {
    clave: 'stockBajo',
    titulo: 'Stock bajo',
    etiqueta: 'tag--orange',
    items: reporte.value.critico.stockBajo,
    vacio: 'Ningún medicamento está en o por debajo de su stock mínimo.',
  },
  {
    clave: 'porVencer',
    titulo: `Por vencer (${DIAS_POR_VENCER} días)`,
    etiqueta: 'tag--yellow',
    items: reporte.value.critico.porVencer,
    vacio: 'Ningún medicamento vence dentro de la ventana.',
  },
  {
    clave: 'vencidos',
    titulo: 'Vencidos',
    etiqueta: 'tag--red',
    items: reporte.value.critico.vencidos,
    vacio: 'No hay medicamentos vencidos.',
  },
]);

const datosPresentacion = computed(() => ({
  labels: reporte.value.porPresentacion.map((p) => p.presentacion),
  datasets: [{
    data: reporte.value.porPresentacion.map((p) => p.unidades),
    backgroundColor: SERIE,
    borderRadius: 4,
    borderSkipped: false,
    barPercentage: 0.7,
    categoryPercentage: 0.8,
  }],
}));

const opcionesPresentacion = opcionesEjes();

async function cargar() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/reportes/inventario', { params: { dias: DIAS_POR_VENCER } });
    reporte.value = data;
  } catch (e) {
    reporte.value = null;
    error.value = e.response?.data?.message || 'No se pudo cargar el reporte de inventario';
  } finally {
    loading.value = false;
  }
}

/**
* Marca el body con la clase de impresión de la Fase 3 y lanza el diálogo. La
* clase se quita al terminar para que el reporte vuelva al tema oscuro en
* pantalla; solo el papel va en claro.
**/
function imprimir() {
  document.body.classList.add('modo-impresion');
  window.print();
}

const quitarModoImpresion = () => document.body.classList.remove('modo-impresion');

onMounted(() => {
  window.addEventListener('afterprint', quitarModoImpresion);
  cargar();
});

onUnmounted(() => {
  window.removeEventListener('afterprint', quitarModoImpresion);
  quitarModoImpresion();
});
</script>
