<template>
  <div class="factura-page">
    <div v-if="loading" class="factura-aviso">Cargando comprobante…</div>
    <div v-else-if="error" class="factura-aviso">{{ error }}</div>

    <div v-else class="factura">
      <div class="factura__acciones">
        <button class="btn-imprimir" @click="imprimir">🖨 Imprimir</button>
      </div>

      <div v-if="!venta.estado_venta" class="factura__anulada">ANULADA</div>

      <header class="factura__head">
        <div>
          <div class="emisor__nombre">{{ EMISOR.nombre }}</div>
          <div class="emisor__dato">{{ EMISOR.direccion }}</div>
          <div class="emisor__dato">NIT: {{ EMISOR.nit }}</div>
        </div>
        <div class="factura__meta">
          <div class="factura__titulo">Comprobante de venta</div>
          <div><span>Folio:</span> <strong>#{{ venta.id_venta }}</strong></div>
          <div><span>Fecha:</span> <strong>{{ venta.fecha_venta }}</strong></div>
        </div>
      </header>

      <section class="factura__partes">
        <div>
          <div class="parte__rotulo">Cliente</div>
          <div class="parte__valor">{{ venta.cliente?.nombre_cliente || '—' }}</div>
          <div class="parte__dato">NIT: {{ nitCliente }}</div>
        </div>
        <div>
          <div class="parte__rotulo">Atención</div>
          <div class="parte__valor">{{ venta.usuario?.nombre_usuario || '—' }}</div>
          <div class="parte__dato">
            Método de pago: {{ venta.detalleMetodoPago?.metodoPago?.nombre_metodo_pago || '—' }}
          </div>
        </div>
      </section>

      <table class="factura__tabla">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="num">Cantidad</th>
            <th class="num">Precio unitario</th>
            <th class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in venta.detalles" :key="d.id_detalle_venta">
            <td>{{ d.medicamento?.nombre_medicamento || '—' }}</td>
            <td class="num">{{ d.cantidad_detalle_venta }}</td>
            <td class="num">{{ moneda(precioUnitario(d)) }}</td>
            <td class="num">{{ moneda(d.subtotal_venta) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="num total__rotulo">Total</td>
            <td class="num total__valor">{{ moneda(venta.total_venta) }}</td>
          </tr>
        </tfoot>
      </table>

      <footer class="factura__pie">
        <div>{{ EMISOR.leyenda }}</div>
        <div class="pie__nota">{{ EMISOR.notaLegal }}</div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api.js';

/**
* Datos del emisor del comprobante. La dirección, el NIT y la nota legal quedan
* como marcadores de posición para que la farmacia los complete con sus datos
* reales; centralizarlos aquí evita tener que buscarlos por la plantilla.
**/
const EMISOR = {
  nombre: 'FarmaSys',
  direccion: '[Dirección de la farmacia]',
  nit: '[NIT del emisor]',
  leyenda: '¡Gracias por su compra!',
  notaLegal: '[Leyenda legal / fiscal pendiente de definir]',
};

const route = useRoute();
const venta = ref(null);
const loading = ref(true);
const error = ref('');

const nitCliente = computed(() => venta.value?.cliente?.nit_cliente || 'CF');

/**
* Calcula el precio unitario de un renglón. detalle_venta no guarda ese dato, así
* que se deriva del subtotal entre la cantidad, protegiendo la división cuando la
* cantidad es cero o no es válida.
*
* @param {object} detalle renglón de la venta con cantidad y subtotal
* @returns {number} el precio de una unidad
**/
const precioUnitario = (detalle) => {
  const cantidad = Number(detalle.cantidad_detalle_venta) || 0;
  if (cantidad <= 0) return 0;
  return Number(detalle.subtotal_venta) / cantidad;
};

/**
* Da formato de quetzales a un importe.
*
* @param {number|string} valor importe a formatear
* @returns {string} el importe con el símbolo Q y dos decimales
**/
const moneda = (valor) => `Q ${Number(valor ?? 0).toFixed(2)}`;

const imprimir = () => window.print();

/**
* El comprobante se imprime sobre fondo blanco, así que marca el body mientras la
* vista está montada para neutralizar el tema oscuro de la aplicación y lo deja
* como estaba al salir.
**/
onMounted(async () => {
  document.body.classList.add('modo-impresion');
  try {
    const { data } = await api.get(`/ventas/${route.params.id}`);
    venta.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo cargar la venta';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => document.body.classList.remove('modo-impresion'));
</script>

<style scoped>
.factura-page {
  min-height: 100vh;
  background: #fff;
  color: #1f2430;
  padding: 32px 16px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
.factura-aviso { text-align: center; color: #6b7280; padding: 40px 0; }

.factura {
  max-width: 780px;
  margin: 0 auto;
  background: #fff;
  position: relative;
}

.factura__acciones { display: flex; justify-content: flex-end; margin-bottom: 18px; }
.btn-imprimir {
  border: 1px solid #d1d5db; background: #f9fafb; color: #1f2430;
  padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.btn-imprimir:hover { background: #f3f4f6; }

.factura__anulada {
  border: 3px solid #dc2626; color: #dc2626;
  font-size: 26px; font-weight: 800; letter-spacing: .18em;
  text-align: center; padding: 8px; margin-bottom: 20px; border-radius: 6px;
}

.factura__head {
  display: flex; justify-content: space-between; gap: 24px;
  padding-bottom: 18px; border-bottom: 2px solid #1f2430;
}
.emisor__nombre { font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.emisor__dato { font-size: 13px; color: #6b7280; margin-top: 3px; }
.factura__meta { text-align: right; font-size: 13px; }
.factura__meta span { color: #6b7280; }
.factura__titulo { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }

.factura__partes {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  padding: 20px 0; border-bottom: 1px solid #e5e7eb;
}
.parte__rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; }
.parte__valor { font-size: 15px; font-weight: 600; margin-top: 4px; }
.parte__dato { font-size: 13px; color: #6b7280; margin-top: 2px; }

.factura__tabla { width: 100%; border-collapse: collapse; margin-top: 20px; }
.factura__tabla th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
  color: #6b7280; padding: 10px 8px; border-bottom: 1px solid #d1d5db;
}
.factura__tabla td { padding: 11px 8px; font-size: 14px; border-bottom: 1px solid #f0f1f3; }
.factura__tabla .num { text-align: right; }
.total__rotulo { font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: .06em; padding-top: 16px; }
.total__valor { font-size: 20px; font-weight: 800; padding-top: 16px; }
.factura__tabla tfoot td { border-bottom: none; border-top: 2px solid #1f2430; }

.factura__pie {
  margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb;
  text-align: center; font-size: 13px;
}
.pie__nota { color: #9ca3af; font-size: 12px; margin-top: 4px; }

@media print {
  .factura-page { padding: 0; }
  .factura__acciones { display: none; }
  .factura { max-width: none; }
}
</style>
