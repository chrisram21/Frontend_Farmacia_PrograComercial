<template>
  <AppLayout title="Reporte de ventas">
    <div class="card panel no-imprimir">
      <div class="panel__head">
        <div class="panel__title">Parámetros del reporte</div>
        <button class="btn btn--primary" @click="imprimir">🖨 Imprimir / Guardar PDF</button>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Desde</label>
          <input type="date" v-model="filtros.desde" @change="cargar" />
        </div>
        <div class="field">
          <label>Hasta</label>
          <input type="date" v-model="filtros.hasta" @change="cargar" />
        </div>
        <div class="field">
          <label>Agrupación</label>
          <select v-model="filtros.agrupacion" @change="cargar">
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="spinner">Cargando…</div>
    <div v-else-if="!reporte" class="card panel" style="margin-top:22px">
      <div class="empty">{{ error || 'No se pudo cargar el reporte.' }}</div>
    </div>

    <template v-else>
      <div class="reporte__titulo">
        Ventas del {{ reporte.rango.desde }} al {{ reporte.rango.hasta }}
        <span class="muted">· agrupado por {{ filtros.agrupacion === 'mes' ? 'mes' : 'día' }}</span>
      </div>

      <div class="grid grid-4" style="margin-top:18px">
        <StatCard icon="💰" label="Total vendido" :value="moneda(reporte.resumen.totalVendido)" />
        <StatCard icon="🧾" label="Número de ventas" :value="reporte.resumen.numeroVentas" />
        <StatCard icon="📊" label="Ticket promedio" :value="moneda(reporte.resumen.ticketPromedio)" />
        <StatCard icon="🚫" label="Ventas anuladas" :value="reporte.resumen.numeroAnuladas" />
      </div>

      <div class="card panel grafica" style="margin-top:22px">
        <div class="panel__head"><div class="panel__title">Ventas por período (Q)</div></div>
        <div v-if="reporte.porPeriodo.length" class="grafica__lienzo">
          <Line :data="datosPeriodo" :options="opcionesPeriodo" />
        </div>
        <div v-else class="empty">Sin ventas en este rango.</div>
      </div>

      <div class="grid grid-2" style="margin-top:22px">
        <div class="card panel grafica">
          <div class="panel__head"><div class="panel__title">Top medicamentos (Q vendidos)</div></div>
          <div v-if="reporte.topMedicamentos.length" class="grafica__lienzo">
            <Bar :data="datosMedicamentos" :options="opcionesHorizontal" />
          </div>
          <div v-else class="empty">Sin datos en este rango.</div>
        </div>

        <div class="card panel grafica">
          <div class="panel__head"><div class="panel__title">Ventas por vendedor (Q)</div></div>
          <div v-if="reporte.porVendedor.length" class="grafica__lienzo">
            <Bar :data="datosVendedor" :options="opcionesHorizontal" />
          </div>
          <div v-else class="empty">Sin datos en este rango.</div>
        </div>
      </div>

      <div class="card panel grafica" style="margin-top:22px">
        <div class="panel__head"><div class="panel__title">Ventas por método de pago</div></div>
        <div v-if="reporte.porMetodoPago.length" class="reporte__dona">
          <div class="grafica__lienzo">
            <Doughnut :data="datosMetodoPago" :options="opcionesDona()" />
          </div>
          <table>
            <thead>
              <tr><th>Método</th><th>Ventas</th><th>Total</th><th>Participación</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in reporte.porMetodoPago" :key="m.metodo">
                <td>{{ m.metodo }}</td>
                <td>{{ m.cantidad }}</td>
                <td>{{ moneda(m.total) }}</td>
                <td>{{ participacion(m.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">Sin datos en este rango.</div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Line, Bar, Doughnut } from 'vue-chartjs';
import AppLayout from '../components/layout/AppLayout.vue';
import StatCard from '../components/ui/StatCard.vue';
import api from '../services/api.js';
import { SERIE, agruparCategorias, opcionesEjes, opcionesDona } from '../config/graficas.js';

const DIAS_RANGO = 30;

const loading = ref(true);
const reporte = ref(null);
const error = ref('');
const filtros = reactive({ desde: '', hasta: '', agrupacion: 'dia' });

const moneda = (valor) => `Q ${Number(valor ?? 0).toFixed(2)}`;

/**
* Fecha local en formato YYYY-MM-DD, que es lo que espera tanto el input date
* como el endpoint del reporte.
*
* @param {Date} fecha fecha a formatear
* @returns {string} la fecha como YYYY-MM-DD
**/
const aISO = (fecha) => {
  const desfase = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 10);
};

const participacion = (total) => {
  const suma = reporte.value.porMetodoPago.reduce((s, m) => s + m.total, 0);
  return suma > 0 ? `${((total / suma) * 100).toFixed(1)} %` : '—';
};

const datosPeriodo = computed(() => ({
  labels: reporte.value.porPeriodo.map((p) => p.periodo),
  datasets: [{
    data: reporte.value.porPeriodo.map((p) => p.total),
    borderColor: SERIE,
    backgroundColor: 'rgba(57, 135, 229, 0.15)',
    borderWidth: 2,
    pointRadius: 4,
    pointBackgroundColor: SERIE,
    tension: 0.25,
    fill: true,
  }],
}));

const opcionesPeriodo = opcionesEjes();

const barrasHorizontales = (filas, etiqueta, valor) => ({
  labels: filas.map((f) => f[etiqueta]),
  datasets: [{
    data: filas.map((f) => f[valor]),
    backgroundColor: SERIE,
    borderRadius: 4,
    borderSkipped: false,
    barPercentage: 0.75,
    categoryPercentage: 0.8,
  }],
});

const datosMedicamentos = computed(() => barrasHorizontales(reporte.value.topMedicamentos, 'medicamento', 'total'));
const datosVendedor = computed(() => barrasHorizontales(reporte.value.porVendedor, 'vendedor', 'total'));
const opcionesHorizontal = opcionesEjes({ indexAxis: 'y' });

const datosMetodoPago = computed(() => {
  const { etiquetas, valores, colores } = agruparCategorias(reporte.value.porMetodoPago, 'metodo', 'total');
  return {
    labels: etiquetas,
    datasets: [{ data: valores, backgroundColor: colores, borderWidth: 2, borderColor: 'transparent' }],
  };
});

async function cargar() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/reportes/ventas', { params: { ...filtros } });
    reporte.value = data;
    filtros.desde = data.rango.desde;
    filtros.hasta = data.rango.hasta;
  } catch (e) {
    reporte.value = null;
    error.value = e.response?.data?.message || 'No se pudo cargar el reporte de ventas';
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
  const hoy = new Date();
  const inicio = new Date();
  inicio.setDate(hoy.getDate() - DIAS_RANGO);
  filtros.hasta = aISO(hoy);
  filtros.desde = aISO(inicio);

  window.addEventListener('afterprint', quitarModoImpresion);
  cargar();
});

onUnmounted(() => {
  window.removeEventListener('afterprint', quitarModoImpresion);
  quitarModoImpresion();
});
</script>
