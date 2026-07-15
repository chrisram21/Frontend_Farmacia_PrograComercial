<template>
  <AppLayout title="Ventas">
    <div class="card panel">
      <div class="panel__head">
        <div class="panel__title">Registro de ventas</div>
        <button class="btn btn--primary" @click="abrirNueva">+ Nueva venta</button>
      </div>

      <div v-if="loading" class="spinner">Cargando…</div>
      <table v-else-if="ventas.length">
        <thead>
          <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Método</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id_venta">
            <td>{{ v.id_venta }}</td>
            <td>{{ v.fecha_venta }}</td>
            <td>{{ v.cliente?.nombre_cliente }}</td>
            <td>{{ v.usuario?.nombre_usuario }}</td>
            <td>{{ v.detalleMetodoPago?.metodoPago?.nombre_metodo_pago }}</td>
            <td>Q {{ Number(v.total_venta).toFixed(2) }}</td>
            <td>
              <span :class="v.estado_venta ? 'tag tag--green' : 'tag tag--red'">
                {{ v.estado_venta ? 'Completada' : 'Anulada' }}
              </span>
            </td>
            <td>
              <button v-if="v.estado_venta" class="action-btn del" title="Anular" @click="anular(v)">🗑</button>
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">Aún no hay ventas registradas.</div>
    </div>

    <!-- Modal nueva venta -->
    <Modal v-if="showModal" title="Nueva venta" @close="showModal = false">
      <div v-if="error" class="error-text">{{ error }}</div>

      <div class="field-row">
        <div class="field">
          <label>Cliente</label>
          <select v-model="venta.id_cliente">
            <option :value="null" disabled>Seleccione…</option>
            <option v-for="c in clientes" :key="c.id_cliente" :value="c.id_cliente">{{ c.nombre_cliente }}</option>
          </select>
        </div>
        <div class="field">
          <label>Método de pago</label>
          <select v-model="venta.id_metodo_pago">
            <option :value="null" disabled>Seleccione…</option>
            <option v-for="m in metodos" :key="m.id_metodo_pago" :value="m.id_metodo_pago">{{ m.nombre_metodo_pago }}</option>
          </select>
        </div>
      </div>

      <label style="font-size:13px; color:var(--text-muted)">Medicamentos</label>
      <div v-for="(l, i) in venta.detalles" :key="i" class="linea">
        <select v-model="l.id_medicamento" @change="onMedChange(l)">
          <option :value="null" disabled>Medicamento…</option>
          <option v-for="med in medicamentos" :key="med.id_medicamento" :value="med.id_medicamento">
            {{ med.nombre_medicamento }} (stock: {{ med.existencia_total }})
          </option>
        </select>
        <input type="number" min="1" v-model.number="l.cantidad_detalle_venta" placeholder="Cant." style="width:80px" />
        <span class="subtotal">Q {{ subtotal(l).toFixed(2) }}</span>
        <button class="action-btn del" @click="venta.detalles.splice(i, 1)">✕</button>
      </div>
      <button class="btn btn--ghost" style="margin-top:6px" @click="agregarLinea">+ Agregar renglón</button>

      <div class="total-row">
        <span>Total</span>
        <strong>Q {{ total.toFixed(2) }}</strong>
      </div>

      <template #footer>
        <button class="btn btn--ghost" @click="showModal = false">Cancelar</button>
        <button class="btn btn--primary" :disabled="saving" @click="guardar">
          {{ saving ? 'Guardando…' : 'Registrar venta' }}
        </button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import Modal from '../components/ui/Modal.vue';
import api from '../services/api.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();

const ventas = ref([]);
const clientes = ref([]);
const metodos = ref([]);
const medicamentos = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const error = ref('');

const venta = reactive({ id_cliente: null, id_metodo_pago: null, detalles: [] });

async function cargar() {
  loading.value = true;
  const { data } = await api.get('/ventas');
  ventas.value = data;
  loading.value = false;
}

async function abrirNueva() {
  error.value = '';
  venta.id_cliente = null;
  venta.id_metodo_pago = null;
  venta.detalles = [{ id_medicamento: null, cantidad_detalle_venta: 1 }];
  if (!clientes.value.length) {
    const [c, m, med] = await Promise.all([
      api.get('/clientes'), api.get('/metodos-pago'), api.get('/medicamentos'),
    ]);
    clientes.value = c.data;
    metodos.value = m.data;
    medicamentos.value = med.data;
  }
  showModal.value = true;
}

function agregarLinea() {
  venta.detalles.push({ id_medicamento: null, cantidad_detalle_venta: 1 });
}
function onMedChange(l) { if (!l.cantidad_detalle_venta) l.cantidad_detalle_venta = 1; }

function precioDe(id) {
  const med = medicamentos.value.find((m) => m.id_medicamento === id);
  return med ? Number(med.precio_venta) : 0;
}
function subtotal(l) { return precioDe(l.id_medicamento) * (Number(l.cantidad_detalle_venta) || 0); }
const total = computed(() => venta.detalles.reduce((s, l) => s + subtotal(l), 0));

async function guardar() {
  error.value = '';
  if (!venta.id_cliente || !venta.id_metodo_pago) { error.value = 'Selecciona cliente y método de pago'; return; }
  const detalles = venta.detalles.filter((l) => l.id_medicamento && l.cantidad_detalle_venta > 0);
  if (!detalles.length) { error.value = 'Agrega al menos un medicamento'; return; }

  saving.value = true;
  try {
    await api.post('/ventas', {
      id_usuario: auth.usuario?.id_usuario,
      id_cliente: venta.id_cliente,
      id_metodo_pago: venta.id_metodo_pago,
      detalles,
    });
    showModal.value = false;
    await cargar();
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al registrar la venta';
  } finally {
    saving.value = false;
  }
}

async function anular(v) {
  if (!confirm(`¿Anular la venta #${v.id_venta}? Se reintegrará la existencia.`)) return;
  try {
    await api.delete(`/ventas/${v.id_venta}`);
    await cargar();
  } catch (e) {
    alert(e.response?.data?.message || 'No se pudo anular');
  }
}

onMounted(cargar);
</script>

<style scoped>
.linea { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.linea select { flex: 1; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text); }
.linea input { padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text); }
.subtotal { width: 90px; text-align: right; color: var(--text-muted); font-size: 13px; }
.total-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 16px;
}
.total-row strong { color: var(--accent); font-size: 20px; }
</style>
